"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbResume } from "@cygnet/shared";
import type { Profile } from "@cygnet/shared";

interface Props {
  userId: string;
  initialResumes: DbResume[];
  onProfileParsed?: (profile: Partial<Profile>) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeManager({
  userId,
  initialResumes,
  onProfileParsed,
}: Props) {
  const [resumes, setResumes] = useState<DbResume[]>(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedText, setParsedText] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        setError("File must be smaller than 10 MB.");
        return;
      }
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const supabase = createClient();
        const id = crypto.randomUUID();
        const storagePath = `${userId}/${id}.pdf`;

        const { error: uploadErr } = await supabase.storage
          .from("resumes")
          .upload(storagePath, file, { contentType: "application/pdf" });

        if (uploadErr) throw uploadErr;

        const row = {
          id,
          user_id: userId,
          file_name: file.name,
          storage_path: storagePath,
          file_size: file.size,
          content_type: "application/pdf",
          label: file.name.replace(/\.pdf$/i, ""),
        };

        const { data, error: dbErr } = await supabase
          .from("resumes")
          .insert(row)
          .select()
          .single<DbResume>();

        if (dbErr) throw dbErr;
        if (data) setResumes((prev) => [data, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [userId],
  );

  const deleteResume = useCallback(
    async (resume: DbResume) => {
      try {
        const supabase = createClient();

        await supabase.storage.from("resumes").remove([resume.storage_path]);
        const { error: dbErr } = await supabase
          .from("resumes")
          .delete()
          .eq("id", resume.id);

        if (dbErr) throw dbErr;
        setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      }
    },
    [],
  );

  const parseResume = useCallback(
    async (resume: DbResume) => {
      setParsing(resume.id);
      setError(null);
      setParsedText(null);

      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePath: resume.storage_path }),
        });

        if (!res.ok) throw new Error("Parse request failed.");

        const data = await res.json();
        setParsedText(data.rawText?.slice(0, 2000) ?? null);

        if (data.profile && onProfileParsed) {
          onProfileParsed(data.profile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Parse failed.");
      } finally {
        setParsing(null);
      }
    },
    [onProfileParsed],
  );

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-brand-ink">Resumes</h2>

      {/* Upload area */}
      <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-line bg-brand-bg/30 px-4 py-8 text-center transition-colors hover:border-brand hover:bg-brand-bg/60">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="mb-2 h-8 w-8 text-brand-muted"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="text-sm font-medium text-brand-muted">
          {uploading ? "Uploading…" : "Upload PDF resume"}
        </span>
        <span className="mt-1 text-xs text-brand-muted/70">Max 10 MB</span>
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Resume list */}
      {resumes.length === 0 ? (
        <p className="py-6 text-center text-sm text-brand-muted">
          No resumes uploaded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {resumes.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-brand-line bg-brand-bg/20 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">
                    {r.file_name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {formatBytes(r.file_size)} ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteResume(r)}
                  className="shrink-0 rounded-md p-1 text-brand-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => parseResume(r)}
                  disabled={parsing === r.id}
                  className="rounded-lg border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand hover:text-brand-ink disabled:opacity-50"
                >
                  {parsing === r.id ? "Parsing…" : "Parse resume"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Parsed text preview */}
      {parsedText && (
        <div className="mt-4 rounded-xl border border-brand-line bg-brand-bg/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand">
              Extracted text
            </h3>
            <button
              type="button"
              onClick={() => setParsedText(null)}
              className="text-xs text-brand-muted hover:text-brand-ink"
            >
              Close
            </button>
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-brand-muted">
            {parsedText}
          </pre>
        </div>
      )}
    </div>
  );
}
