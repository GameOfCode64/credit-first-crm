"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getUploadSession, confirmUpload } from "@/services/upload.service";

import { Button } from "../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { useNavigate } from "react-router-dom";

/* ================= PROPS ================= */

interface Props {
  uploadId: string;
  onBack: () => void;
}

/* ================= COMPONENT ================= */

export default function ConfirmStep({ uploadId, onBack }: Props) {
  const navigate = useNavigate();
  /* ===== FETCH FINAL SESSION STATE ===== */

  const { data, isLoading } = useQuery({
    queryKey: ["upload-session", uploadId],
    queryFn: () => getUploadSession(uploadId),
  });

  /* ===== CONFIRM IMPORT ===== */

  const mutation = useMutation({
    mutationFn: () => confirmUpload(uploadId),
    onSuccess: () => {
      toast.success("Leads imported successfully");
      navigate("/manager/leads");
    },
    onError: (e: any) => toast.error(e.message || "Failed to import leads"),
  });

  if (isLoading || !data) {
    return <div>Loading…</div>;
  }

  const stats = data.stats;

  /* ================= RENDER ================= */

  return (
    <div className="max-w-2xl mx-auto">
      {/* SUCCESS ICON */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#b98b08] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Ready to Import</h2>
        <p className="text-gray-600">
          Review the details and confirm the upload
        </p>
      </div>

      {/* SUMMARY */}
      <div className="rounded-xl border bg-gray-50 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
          Import Summary
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">File</span>
            <span className="font-medium">{data.fileName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Total Rows</span>
            <span className="font-medium">{stats?.totalRows ?? 0}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Duplicates Found</span>
            <span className="font-medium text-red-600">
              {stats?.duplicateCount ?? 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Unique Leads</span>
            <span className="font-medium text-green-600">
              {stats?.uniqueCount ?? 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Duplicate Rule</span>
            <span className="font-medium">
              {data.duplicateRule?.action ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* INFO */}
      <Alert className="mb-8">
        <AlertDescription>
          This action will permanently import the leads into CRM. You cannot
          undo this operation.
        </AlertDescription>
      </Alert>

      {/* ACTIONS */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-[#b98b08] hover:bg-[#a47a07]"
        >
          {mutation.isPending ? "Importing..." : "Confirm & Import"}
        </Button>
      </div>
    </div>
  );
}
