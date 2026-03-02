"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getUploadSession, saveMappings } from "@/services/upload.service";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";

/* ================= TYPES ================= */

interface MappingRow {
  excelColumn: string;
  targetField: string; // skip | phone | personName | companyName | meta.xxx
  customField: string;
}

interface Props {
  uploadId: string;
  onNext: () => void;
  onBack: () => void;
}

/* ================= CONSTANTS ================= */

const SKIP = "skip";

/* ================= COMPONENT ================= */

export default function MapFieldsStep({ uploadId, onNext, onBack }: Props) {
  const [rows, setRows] = useState<MappingRow[]>([]);

  /* ================= FETCH UPLOAD SESSION ================= */

  const { data, isLoading, isError } = useQuery({
    queryKey: ["upload-session", uploadId],
    queryFn: () => getUploadSession(uploadId),
    enabled: !!uploadId,
  });

  /* ================= AUTO MAP HEADERS ================= */

  useEffect(() => {
    if (!data?.headers?.length) return;

    const mapped: MappingRow[] = data.headers.map((header: string) => ({
      excelColumn: header,
      targetField: autoMap(header),
      customField: "",
    }));

    setRows(mapped);
  }, [data]);

  /* ================= SMART MAPPING ================= */

  const autoMap = (header: string) => {
    const h = header.toLowerCase();

    if (h.includes("phone") || h.includes("mobile")) return "phone";
    if (h.includes("person") || h === "name") return "personName";
    if (h.includes("company")) return "companyName";
    if (h.includes("email")) return "meta.email";

    return SKIP;
  };

  /* ================= UPDATE ROW ================= */

  const updateRow = (index: number, key: keyof MappingRow, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  /* ================= SAMPLE VALUE ================= */

  const sampleValue = (column: string) => {
    if (!data?.sampleRows?.length) return "—";
    const value = data.sampleRows[0]?.[column];
    if (!value) return "—";
    return String(value).slice(0, 40);
  };

  /* ================= SAVE MAPPINGS ================= */

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = rows
        .filter((r) => r.targetField !== SKIP)
        .map((r) => ({
          excelColumn: r.excelColumn,
          targetField:
            r.targetField === "custom"
              ? `meta.${r.customField.trim()}`
              : r.targetField,
        }));

      if (!payload.length) {
        throw new Error("Map at least one field");
      }

      return saveMappings(uploadId, payload);
    },
    onSuccess: () => {
      toast.success("Field mappings saved");
      onNext();
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to save mappings");
    },
  });

  const canContinue = rows.some(
    (r) =>
      r.targetField !== SKIP &&
      (r.targetField !== "custom" || r.customField.trim()),
  );

  /* ================= RENDER ================= */

  if (isLoading) {
    return <div className="text-center py-12">Loading upload data…</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load upload session
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Map Fields</h2>
        <p className="text-gray-600">
          Match your file columns with Lead fields
        </p>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          We auto-mapped common fields like phone & name.
        </AlertDescription>
      </Alert>

      {/* MAPPING LIST */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
        {rows.map((row, idx) => (
          <div
            key={row.excelColumn}
            className="rounded-xl border bg-gray-50 p-4"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* EXCEL COLUMN */}
              <div className="col-span-5">
                <Label className="text-xs">Excel Column</Label>
                <div className="mt-1 rounded-md border bg-white p-2">
                  <p className="font-medium">{row.excelColumn}</p>
                  <p className="text-xs text-gray-500">
                    Sample: {sampleValue(row.excelColumn)}
                  </p>
                </div>
              </div>

              {/* ARROW */}
              <div className="col-span-1 text-center text-gray-400">→</div>

              {/* TARGET FIELD */}
              <div className="col-span-6">
                <Label className="text-xs">Lead Field</Label>
                <Select
                  value={row.targetField}
                  onValueChange={(v) => updateRow(idx, "targetField", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SKIP}>Skip this column</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="personName">Person Name</SelectItem>
                    <SelectItem value="companyName">Company Name</SelectItem>
                    <SelectItem value="custom">Custom Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CUSTOM FIELD */}
            {row.targetField === "custom" && (
              <div className="mt-4">
                <Label className="text-xs">Custom Field Key</Label>
                <Input
                  placeholder="e.g. gstNumber"
                  value={row.customField}
                  onChange={(e) =>
                    updateRow(idx, "customField", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
        <b>{rows.filter((r) => r.targetField !== SKIP).length}</b> mapped •{" "}
        <b>{rows.filter((r) => r.targetField === SKIP).length}</b> skipped
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between pt-6 border-t mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={!canContinue || mutation.isPending}
          className="bg-[#b98b08] hover:bg-[#a47a07]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
