"use client";

import { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { createUpload } from "../../../../../services/upload.service";

/* ================= TYPES ================= */

export interface UploadResponse {
  id: string;
  fileName: string;
  headers: string[];
  sampleRows: Record<string, any>[];
  status?: string;
}

/* ================= COMPONENT ================= */

export default function UploadFileStep({
  onNext,
}: {
  onNext: (data: UploadResponse) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  /* ================= DRAG & DROP ================= */

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createUpload(file);

      // 🔒 HARD GUARDS (prevents undefined bugs later)
      if (!res?.id) {
        throw new Error("Upload failed: missing upload ID");
      }

      if (!Array.isArray(res.headers)) {
        throw new Error("Upload failed: headers missing");
      }

      if (!Array.isArray(res.sampleRows)) {
        throw new Error("Upload failed: sample rows missing");
      }

      onNext(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to upload file");
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {/* ERROR */}
      {error && (
        <div className="w-full max-w-2xl mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* UPLOAD AREA */}
      <div
        className={`
          relative w-full max-w-2xl rounded-2xl border-2 border-dashed p-12
          flex flex-col items-center justify-center transition-all duration-200
          ${
            dragActive
              ? "border-[#b98b08] bg-[#b98b08]/5 scale-[1.02]"
              : file
                ? "border-[#b98b08] bg-[#b98b08]/5"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleChange}
        />

        {/* ICON */}
        <div
          className={`mb-4 h-16 w-16 rounded-full flex items-center justify-center
            ${file ? "bg-[#b98b08]" : "bg-gray-100"}`}
        >
          {file ? (
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}
        </div>

        {/* TEXT */}
        {file ? (
          <>
            <p className="text-lg font-semibold">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="mt-3 text-sm text-[#b98b08] hover:text-[#9a7507]"
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-700">
              Drop your file here, or{" "}
              <span className="text-[#b98b08]">browse</span>
            </p>
            <p className="text-sm text-gray-500">CSV, XLSX, XLS supported</p>
          </>
        )}
      </div>

      {/* CONTINUE */}
      <Button
        onClick={submit}
        disabled={!file || loading}
        className="mt-8 px-8 py-3 rounded-xl font-semibold shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: file && !loading ? "#b98b08" : undefined,
        }}
      >
        {loading ? "Uploading..." : "Continue"}
      </Button>
    </div>
  );
}
