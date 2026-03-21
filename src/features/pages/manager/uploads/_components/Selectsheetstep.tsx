"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { getUploadSession, selectSheet } from "@/services/upload.service";
import { Button } from "../../../../../components/ui/button";

/* ================= PROPS ================= */

interface Props {
  uploadId: string;
  onNext: () => void;
  onBack: () => void;
}

/* ================= COMPONENT ================= */

export default function SelectSheetStep({ uploadId, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<string>("");

  /* ── Fetch upload session — sheets come from UploadFileStep response ── */
  const { data, isLoading } = useQuery({
    queryKey: ["upload-session", uploadId],
    queryFn: () => getUploadSession(uploadId),
    enabled: !!uploadId,
  });

  /* ── sheets: string[] returned from the initial upload ── */
  const sheets: string[] = data?.sheets ?? [];

  /* ── Auto-select if only one sheet ── */
  const effectiveSelected = selected || (sheets.length === 1 ? sheets[0] : "");

  /* ── Confirm sheet selection ── */
  const mutation = useMutation({
    mutationFn: () => selectSheet(uploadId, effectiveSelected),
    onSuccess: () => {
      toast.success(`Sheet "${effectiveSelected}" selected`);
      onNext();
    },
    onError: (e: any) => toast.error(e?.message || "Failed to select sheet"),
  });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading sheets…
      </div>
    );
  }

  /* ── No sheets (CSV or single-sheet — skip automatically handled by parent) ── */
  if (!sheets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500 text-sm">No sheets found in this file.</p>
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Select Sheet</h2>
        <p className="text-gray-600">
          Your file has multiple sheets — choose the one that contains your
          leads
        </p>
      </div>

      {/* SHEET GRID */}
      <div className="grid grid-cols-2 gap-3 mb-8 max-h-[420px] overflow-y-auto pr-1">
        {sheets.map((sheet) => {
          const isActive = effectiveSelected === sheet;
          return (
            <button
              key={sheet}
              onClick={() => setSelected(sheet)}
              className={`
                relative flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-150
                ${
                  isActive
                    ? "border-[#b98b08] bg-[#b98b08]/5 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isActive ? "bg-[#b98b08]" : "bg-gray-100"}`}
              >
                <FileSpreadsheet
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`}
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold truncate ${isActive ? "text-[#b98b08]" : "text-gray-800"}`}
                >
                  {sheet}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Sheet</p>
              </div>

              {/* Check */}
              {isActive && (
                <CheckCircle2 className="w-5 h-5 text-[#b98b08] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* SELECTED INDICATOR */}
      {effectiveSelected && (
        <div className="mb-8 rounded-lg bg-[#b98b08]/5 border border-[#b98b08]/20 px-4 py-3 text-sm">
          <span className="text-gray-500">Selected: </span>
          <span className="font-semibold text-[#b98b08]">
            {effectiveSelected}
          </span>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={!effectiveSelected || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="bg-[#b98b08] hover:bg-[#a47a07]"
        >
          {mutation.isPending ? "Loading sheet…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
