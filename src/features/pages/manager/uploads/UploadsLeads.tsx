"use client";

import { useState } from "react";

import UploadStepper from "./UploadStepper";
import UploadFileStep from "./_components/UploadFileStep";
import MapFieldsStep from "./_components/MapFieldsStep";
import DuplicateRulesStep from "./_components/DuplicateRulesStep";
import CampaignStep from "./_components/CampaignStep";
import ConfirmStep from "./_components/ConfirmStep";

/* ================= STEPS ================= */

const steps = ["Upload", "Map Fields", "Duplicates", "Campaign", "Confirm"];

/* ================= TYPES ================= */

interface UploadData {
  id: string;
  fileName: string;
  headers: string[];
  sampleRows: Record<string, any>[];
}

/* ================= PAGE ================= */

export default function UploadLeadsPage() {
  const [step, setStep] = useState(0);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);

  /* ================= GUARD ================= */

  const uploadId = uploadData?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import Leads
          </h1>
          <p className="text-gray-600">
            Upload and configure your lead data in a few simple steps
          </p>
        </div>

        {/* ================= STEPPER ================= */}
        <div className="mb-10">
          <UploadStepper step={step} steps={steps} />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="min-h-[480px] rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          {/* STEP 0 — FILE UPLOAD */}
          {step === 0 && (
            <UploadFileStep
              onNext={(data) => {
                // 🔒 CRITICAL: store full upload response
                setUploadData(data);
                setStep(1);
              }}
            />
          )}

          {/* STEP 1 — MAP FIELDS */}
          {step === 1 && uploadId && (
            <MapFieldsStep
              uploadId={uploadId}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {/* STEP 2 — DUPLICATES */}
          {step === 2 && uploadId && (
            <DuplicateRulesStep
              uploadId={uploadId}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {/* STEP 3 — CAMPAIGN */}
          {step === 3 && uploadId && (
            <CampaignStep
              uploadId={uploadId}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {/* STEP 4 — CONFIRM */}
          {step === 4 && uploadId && (
            <ConfirmStep uploadId={uploadId} onBack={() => setStep(3)} />
          )}

          {/* SAFETY FALLBACK */}
          {step > 0 && !uploadId && (
            <div className="text-center text-red-600 font-medium">
              Upload session not found. Please restart the upload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
