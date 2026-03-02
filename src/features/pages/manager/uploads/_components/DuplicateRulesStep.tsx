"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getUploadSession,
  saveDuplicateRules,
  DuplicateAction,
} from "@/services/upload.service";

import { Button } from "../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Card, CardContent } from "../../../../../components/ui/card";

/* ================= PROPS ================= */

interface Props {
  uploadId: string;
  onNext: () => void;
  onBack: () => void;
}

/* ================= COMPONENT ================= */

export default function DuplicateRulesStep({
  uploadId,
  onNext,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<DuplicateAction>("SKIP");

  /* ================= FETCH SESSION ================= */

  const { data, isLoading } = useQuery({
    queryKey: ["upload-session", uploadId],
    queryFn: () => getUploadSession(uploadId),
    enabled: !!uploadId,
  });

  /* ================= SAVE RULE ================= */

  const mutation = useMutation({
    mutationFn: () =>
      saveDuplicateRules(uploadId, {
        field: "phone",
        action: selected,
      }),
    onSuccess: () => {
      toast.success("Duplicate rule saved");
      onNext();
    },
  });

  const stats = data?.stats;

  /* ================= RENDER ================= */

  if (isLoading) {
    return <div className="py-12 text-center">Loading duplicate data…</div>;
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Handle Duplicates</h2>
        <p className="text-gray-600">
          Choose how duplicate phone numbers should be handled
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Rows</p>
            <p className="text-xl font-bold">{stats?.totalRows ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">Duplicates</p>
            <p className="text-xl font-bold text-red-700">
              {stats?.duplicateCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-600">Unique</p>
            <p className="text-xl font-bold text-green-700">
              {stats?.uniqueCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OPTIONS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            value: "SKIP",
            title: "Skip Duplicates",
            desc: "Existing leads will be ignored",
          },
          {
            value: "UPDATE",
            title: "Update Existing",
            desc: "Existing leads will be updated",
          },
          {
            value: "KEEP_BOTH",
            title: "Keep Both",
            desc: "Duplicates will be imported as new leads",
          },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value as DuplicateAction)}
            className={`rounded-xl border-2 p-5 text-left transition
              ${
                selected === opt.value
                  ? "border-[#b98b08] bg-[#b98b08]/5 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <h3 className="font-semibold mb-1">{opt.title}</h3>
            <p className="text-sm text-gray-500">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* INFO */}
      <Alert className="mb-8">
        <AlertDescription>
          Duplicates are detected using <b>Phone Number</b>.
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
          Continue
        </Button>
      </div>
    </div>
  );
}
