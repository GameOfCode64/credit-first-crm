"use client";

import { useState } from "react";

import UploadStepper from "./UploadStepper";
import UploadFileStep from "./_components/UploadFileStep";
import SelectSheetStep from "./_components/Selectsheetstep";
import MapFieldsStep from "./_components/MapFieldsStep";
import DuplicateRulesStep from "./_components/DuplicateRulesStep";
import CampaignStep from "./_components/CampaignStep";
import ConfirmStep from "./_components/ConfirmStep";

/* ================= STEPS ================= */

const STEPS = [
  "Upload",
  "Select Sheet",
  "Map Fields",
  "Duplicates",
  "Campaign",
  "Confirm",
];

/* ================= TYPES ================= */

interface UploadData {
  id: string;
  fileName: string;
  headers: string[];
  sampleRows: Record<string, any>[];
  sheets: string[]; // ← sheet names returned by backend after upload
}

interface UploadResponse {
  id: string;
  fileName: string;
  headers: string[];
  sampleRows: Record<string, any>[];
  sheets?: string[];
}

/* ================= PAGE ================= */

export default function UploadLeadsPage() {
  const [step, setStep] = useState(0);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);

  const uploadId = uploadData?.id;

  /* ── After upload: if file has only 1 sheet (or is CSV),
     skip the sheet-selection step automatically              ── */
  const handleUploadNext = (data: UploadResponse) => {
    const fullData: UploadData = {
      ...data,
      sheets: data.sheets ?? [],
    };
    setUploadData(fullData);
    const hasMultipleSheets =
      Array.isArray(fullData.sheets) && fullData.sheets.length > 1;
    setStep(hasMultipleSheets ? 1 : 2); // skip step 1 if no choice needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import Leads
          </h1>
          <p className="text-gray-600">
            Upload and configure your lead data in a few simple steps
          </p>
        </div>

        {/* STEPPER */}
        <div className="mb-10">
          <UploadStepper step={step} steps={STEPS} />
        </div>

        {/* CONTENT */}
        <div className="min-h-[480px] rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          {/* STEP 0 — FILE UPLOAD */}
          {step === 0 && <UploadFileStep onNext={handleUploadNext} />}

          {/* STEP 1 — SELECT SHEET (multi-sheet Excel only) */}
          {step === 1 && uploadId && (
            <SelectSheetStep
              uploadId={uploadId}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {/* STEP 2 — MAP FIELDS */}
          {step === 2 && uploadId && (
            <MapFieldsStep
              uploadId={uploadId}
              onNext={() => setStep(3)}
              onBack={() => {
                // back goes to sheet selection only if there were multiple sheets
                const hasMultiple =
                  Array.isArray(uploadData?.sheets) &&
                  uploadData!.sheets.length > 1;
                setStep(hasMultiple ? 1 : 0);
              }}
            />
          )}

          {/* STEP 3 — DUPLICATES */}
          {step === 3 && uploadId && (
            <DuplicateRulesStep
              uploadId={uploadId}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {/* STEP 4 — CAMPAIGN */}
          {step === 4 && uploadId && (
            <CampaignStep
              uploadId={uploadId}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {/* STEP 5 — CONFIRM */}
          {step === 5 && uploadId && (
            <ConfirmStep uploadId={uploadId} onBack={() => setStep(4)} />
          )}

          {/* SAFETY FALLBACK */}
          {step > 0 && !uploadId && (
            <div className="text-center text-red-600 font-medium py-12">
              Upload session not found. Please restart the upload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
