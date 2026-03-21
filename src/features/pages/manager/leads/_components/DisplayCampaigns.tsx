"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Search,
  RefreshCw,
  Plus,
  Flag,
  BarChart2,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FolderOpen,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchCampaigns, Campaign } from "@/services/campaign.service";

/* ─────────────────────────
   HELPERS
───────────────────────── */
const fmtLeads = (n: number) => {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + "K";
  return String(n);
};

const fmtRelative = (d: string) => {
  if (!d) return "—";
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true });
  } catch {
    return "—";
  }
};

/* ─────────────────────────
   CIRCULAR PROGRESS
───────────────────────── */
function CircularProgress({ pct }: { pct: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const p = Math.min(Math.max(pct ?? 0, 0), 100);
  const fg = (p / 100) * c;

  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg
        width="44"
        height="44"
        className="-rotate-90"
        style={{ overflow: "visible" }}
      >
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeDasharray={`${fg} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-gray-800 leading-none">
        {p}%
      </span>
    </div>
  );
}

/* ─────────────────────────
   ASSIGNEE AVATARS
───────────────────────── */
const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
];

function AssigneeAvatars({ list }: { list: any[] }) {
  if (!list?.length) return <span className="text-gray-400 text-sm">—</span>;
  const vis = list.slice(0, 5);
  const extra = list.length - vis.length;
  return (
    <div className="flex items-center">
      {vis.map((a, i) => (
        <div
          key={a.id || i}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 -ml-1.5 first:ml-0"
          style={{
            backgroundColor: COLORS[i % COLORS.length],
            zIndex: vis.length - i,
          }}
          title={a.name}
        >
          {(a.name || "?").slice(0, 2).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold -ml-1.5"
          style={{ zIndex: 0 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────
   PAGE
───────────────────────── */
const PAGE_SIZE = 20;

export default function ManagerCampaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [dateFlt, setDateFlt] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [createdBy, setCreatedBy] = useState("all");
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Fetch all campaigns (manager sees everything) ── */
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  const campaigns: Campaign[] = useMemo(() => {
    const raw = data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  /* ── Dropdown options ── */
  const allAssignees = useMemo(() => {
    const map = new Map<string, any>();
    campaigns.forEach((c: any) =>
      (c.assignees || []).forEach((a: any) => a?.id && map.set(a.id, a)),
    );
    return Array.from(map.values());
  }, [campaigns]);

  const allCreators = useMemo(() => {
    const map = new Map<string, any>();
    campaigns.forEach(
      (c: any) => c.createdBy?.id && map.set(c.createdBy.id, c.createdBy),
    );
    return Array.from(map.values());
  }, [campaigns]);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let res = campaigns.filter((c: any) => {
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (priority === "flagged" && !c.flagged) return false;
      if (priority === "unflagged" && c.flagged) return false;
      if (
        assignee !== "all" &&
        !(c.assignees || []).some((a: any) => a.id === assignee)
      )
        return false;
      if (
        createdBy !== "all" &&
        (c.createdBy?.id ?? c.createdById) !== createdBy
      )
        return false;
      if (dateFlt !== "all") {
        const days = ({ "7d": 7, "30d": 30, "90d": 90 } as any)[dateFlt];
        if (
          days &&
          new Date(c.createdAt).getTime() < Date.now() - days * 86400000
        )
          return false;
      }
      return true;
    });

    res = [...res].sort((a: any, b: any) => {
      const va = (a as any).flagged ? 1 : 0,
        vb = (b as any).flagged ? 1 : 0;
      return sortAsc ? vb - va : va - vb;
    });

    return res;
  }, [campaigns, search, priority, assignee, createdBy, dateFlt, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  /* ── Mutations ── */
  const flagMutation = useMutation({
    mutationFn: ({ id, flagged }: any) =>
      api.patch(`/campaigns/${id}`, { flagged: !flagged }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
    onError: () => toast.error("Failed to update flag"),
  });

  const reassignMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/reassign`),
    onSuccess: () => {
      toast.success("Campaign reassigned");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Failed to reassign"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete campaign");
      setDeleteId(null);
    },
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f5]">
      {/* ══ HEADER ══ */}
      <div className="flex-shrink-0 px-8 pt-7 pb-5 bg-[#f5f5f5]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Campaign</h1>
              <button
                onClick={() => refetch()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FILTERS ══ */}
      <div className="flex-shrink-0 px-8 pb-4 bg-[#f5f5f5]">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search campaign"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* ══ TABLE ══ */}
      <div className="flex-1 min-h-0 overflow-auto px-8 pb-2">
        {/* Empty state */}
        {!isLoading && campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-gray-200 shadow-sm">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              No campaigns yet
            </h3>
            <p className="text-sm text-gray-500 mb-6 mt-1">
              Upload leads or create a campaign to get started
            </p>
            <Link to="/manager/campaigns/new">
              <Button
                className="text-white font-semibold px-5"
                style={{ backgroundColor: "#b98b08" }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Create Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-semibold text-gray-700 px-5 py-3.5">
                    Name
                  </th>
                  <th className="text-center text-sm font-semibold text-gray-700 px-4 py-3.5 w-28">
                    <button
                      className="flex items-center gap-1 mx-auto hover:text-gray-900 transition-colors"
                      onClick={() => setSortAsc((v) => !v)}
                    >
                      Priority{" "}
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </th>

                  <th className="text-center text-sm font-semibold text-gray-700 px-4 py-3.5">
                    Total Leads
                  </th>
                  <th className="text-center text-sm font-semibold text-gray-700 px-4 py-3.5">
                    Progress
                  </th>
                  <th className="text-center text-sm font-semibold text-gray-700 px-4 py-3.5">
                    Created on
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-700 px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-t-transparent border-indigo-600 animate-spin" />
                        <p className="text-sm text-gray-400">
                          Loading campaigns…
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart2 className="w-10 h-10 text-gray-200" />
                        <p className="text-sm font-medium text-gray-500">
                          No campaigns match your filters
                        </p>
                        <p className="text-xs text-gray-400">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c: any, idx: number) => {
                    const progress =
                      c.progress != null
                        ? c.progress
                        : Math.round(
                            ((c.calledLeads ?? 0) /
                              Math.max(
                                c.totalLeads ?? c._count?.leads ?? 1,
                                1,
                              )) *
                              100,
                          );

                    const totalLeads = c.totalLeads ?? c._count?.leads ?? 0;

                    return (
                      <tr
                        onClick={() => navigate(`/manager/leads/${c.id}`)}
                        key={c.id}
                        className={cn(
                          "border-b border-gray-100 hover:bg-gray-50/70 transition-colors",
                          idx === paginated.length - 1 && "border-b-0",
                        )}
                      >
                        {/* Name */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {c.name}
                          </p>
                          {c.name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {c.name.toLowerCase().replace(/\s+/g, "-")}
                            </p>
                          )}
                        </td>

                        {/* Priority flag */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() =>
                              flagMutation.mutate({
                                id: c.id,
                                flagged: c.flagged,
                              })
                            }
                            disabled={flagMutation.isPending}
                            className={cn(
                              "p-1 rounded transition-colors mx-auto block",
                              c.flagged
                                ? "text-gray-600 hover:text-gray-700"
                                : "text-gray-300 hover:text-gray-400",
                            )}
                            title={c.flagged ? "Remove flag" : "Flag campaign"}
                          >
                            <Flag
                              className={cn(
                                "w-4 h-4",
                                c.flagged && "fill-gray-500",
                              )}
                            />
                          </button>
                        </td>

                        {/* Total leads */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {fmtLeads(totalLeads)}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <CircularProgress pct={progress} />
                          </div>
                        </td>

                        {/* Created on */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-500">
                            {fmtRelative(c.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-0.5">
                            {/* Stats */}
                            <Link to={`/manager/campaign-dashboard/${c.id}`}>
                              <button
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                title="View stats"
                              >
                                <BarChart2 className="w-4 h-4" />
                              </button>
                            </Link>

                            {/* Reassign */}
                            <button
                              onClick={() => reassignMutation.mutate(c.id)}
                              disabled={reassignMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Reassign leads"
                            >
                              <RotateCcw
                                className={cn(
                                  "w-4 h-4",
                                  reassignMutation.isPending && "animate-spin",
                                )}
                              />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteId(c.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ PAGINATION FOOTER ══ */}
      <div className="flex-shrink-0 px-8 py-3 bg-[#f5f5f5] flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {filtered.length === 0
            ? "0–0 of 0"
            : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors border",
                  page === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ══ DELETE CONFIRM DIALOG ══ */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
