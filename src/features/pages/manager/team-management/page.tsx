import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios instance

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const AVATAR_PALETTE = [
  "bg-amber-600",
  "bg-orange-600",
  "bg-emerald-700",
  "bg-blue-700",
  "bg-violet-700",
  "bg-rose-700",
  "bg-teal-700",
];

const avatarColor = (id = "") =>
  AVATAR_PALETTE[id.charCodeAt(0) % AVATAR_PALETTE.length];

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium border
            animate-[slideIn_0.2s_ease] pointer-events-auto
            ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : t.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-green-50 border-green-200 text-green-700"
            }`}
        >
          <span className="text-base">
            {t.type === "error" ? "⚠️" : t.type === "warning" ? "🌙" : "✓"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Confirm Modal
───────────────────────────────────────────── */
function ConfirmModal({ user, onConfirm, onCancel, loading }) {
  if (!user) return null;
  const deactivating = user.isActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 animate-[slideUp_0.2s_ease]">
        <div className="text-4xl text-center mb-3">
          {deactivating ? "🌙" : "✅"}
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">
          {deactivating ? "Mark as On Leave?" : "Restore to Active?"}
        </h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
          {deactivating
            ? `${user.name} will be deactivated and removed from lead assignments.`
            : `${user.name} will be restored and available for assignments.`}
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors
              ${deactivating ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? "Saving…" : deactivating ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Edit Modal
───────────────────────────────────────────── */
function EditModal({ user, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  if (!user) return null;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 animate-[slideUp_0.2s_ease]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${avatarColor(user.id)}`}
          >
            {initials(user.name)}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Member</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Update {user.name.split(" ")[0]}'s profile
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Full Name", key: "name", type: "text", span: true },
            { label: "Email Address", key: "email", type: "email" },
            { label: "Phone", key: "phone", type: "tel" },
          ].map(({ label, key, type, span }) => (
            <div key={key} className={span ? "col-span-2" : ""}>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none
                  focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-gray-300"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Skeleton Row
───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {["w-36", "w-44", "w-28", "w-12", "w-20", "w-28"].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className={`h-3 ${w} rounded bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]`}
          />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const ManagerTeamManagement = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [confirmUser, setConfirmUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  /* ── Query ── */
  const {
    data: employees = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
  });

  /* ── Mutations ── */
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      addToast(
        `Member marked as ${vars.isActive ? "active" : "on leave"}`,
        vars.isActive ? "success" : "warning",
      );
      setConfirmUser(null);
    },
    onError: () => addToast("Failed to update status", "error"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      addToast("Member details updated");
      setEditUser(null);
    },
    onError: () => addToast("Failed to update details", "error"),
  });

  /* ── Derived ── */
  const list = Array.isArray(employees)
    ? employees
    : (employees?.employees ?? employees?.users ?? []);

  const filtered = list.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    const matchFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && m.isActive) ||
      (filter === "INACTIVE" && !m.isActive);
    return matchSearch && matchFilter;
  });

  const activeCount = list.filter((m) => m.isActive).length;
  const inactiveCount = list.filter((m) => !m.isActive).length;

  return (
    <div className="min-h-full bg-gray-50/60 p-6">
      <Toast toasts={toasts} />

      <ConfirmModal
        user={confirmUser}
        onConfirm={() =>
          toggleMutation.mutate({
            id: confirmUser.id,
            isActive: !confirmUser.isActive,
          })
        }
        onCancel={() => setConfirmUser(null)}
        loading={toggleMutation.isPending}
      />

      <EditModal
        user={editUser}
        onSave={(form) => editMutation.mutate({ id: editUser.id, ...form })}
        onCancel={() => setEditUser(null)}
        loading={editMutation.isPending}
      />

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your team's availability and details
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3.5 mb-5">
        {[
          {
            label: "Total Members",
            value: list.length,
            icon: "👥",
            cls: "bg-amber-50 border-amber-100",
            valCls: "text-amber-700",
          },
          {
            label: "Active",
            value: activeCount,
            icon: "🟢",
            cls: "bg-green-50 border-green-100",
            valCls: "text-green-700",
          },
          {
            label: "On Leave",
            value: inactiveCount,
            icon: "🌙",
            cls: "bg-orange-50 border-orange-100",
            valCls: "text-orange-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-4 border rounded-xl px-5 py-4 ${s.cls}`}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div
                className={`text-2xl font-extrabold leading-none ${s.valCls}`}
              >
                {isLoading ? (
                  <div className="w-8 h-5 rounded bg-current opacity-20 animate-pulse" />
                ) : (
                  s.value
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M15 15l-3-3" strokeLinecap="round" />
          </svg>
          <input
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg
              outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10
              placeholder:text-gray-300 transition-all"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {[
            { key: "ALL", label: "All", count: list.length },
            { key: "ACTIVE", label: "Active", count: activeCount },
            { key: "INACTIVE", label: "On Leave", count: inactiveCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  filter === key
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-200"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"
                }`}
            >
              {label}
              <span
                className={`text-[10px] rounded-full px-1.5 py-px font-semibold
                  ${filter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {isLoading ? "—" : count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-red-600 text-sm">
              Failed to load team members
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Check your connection or try refreshing
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {["Member", "Email", "Phone", "Leads", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="font-medium text-gray-500 text-sm">
                        No members found
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((member, idx) => (
                  <tr
                    key={member.id}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors animate-[fadeIn_0.25s_ease_both]"
                  >
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(member.id)}`}
                        >
                          {initials(member.name)}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white
                              ${member.isActive ? "bg-green-500" : "bg-amber-500"}`}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-[13px] leading-tight">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-gray-400 capitalize">
                            {member.role?.toLowerCase() ?? "employee"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {member.email}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-[13px] text-gray-400">
                      {member.phone || "—"}
                    </td>

                    {/* Leads */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                        {member._count?.assignedLeads ??
                          member.leadsAssigned ??
                          0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${
                            member.isActive
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-green-500" : "bg-amber-500"}`}
                        />
                        {member.isActive ? "Active" : "On Leave"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditUser(member)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 bg-white
                            border border-gray-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all"
                        >
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11.5 2.5a2.121 2.121 0 013 3L5 15H2v-3L11.5 2.5z" />
                          </svg>
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmUser(member)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all
                            ${
                              member.isActive
                                ? "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                                : "bg-green-50 border-green-100 text-green-700 hover:bg-green-100"
                            }`}
                        >
                          {member.isActive ? "🌙 Leave" : "✅ Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ── */}
      {!isLoading && !isError && (
        <p className="text-xs text-gray-400 text-right mt-2.5">
          Showing{" "}
          <span className="font-semibold text-gray-500">{filtered.length}</span>{" "}
          of <span className="font-semibold text-gray-500">{list.length}</span>{" "}
          members
        </p>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ManagerTeamManagement;
