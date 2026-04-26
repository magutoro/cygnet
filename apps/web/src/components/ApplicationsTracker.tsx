"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  APPLICATION_STATUS_ORDER,
  DEFAULT_APPLICATION_INPUT,
  applicationInputToDb,
  dbApplicationToApplication,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type DbApplication,
} from "@cygnet/shared";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { SITE_COPY } from "@/content/site-copy";

interface Props {
  initialApplications: Application[];
  userId: string;
}

type FilterValue = "all" | ApplicationStatus;

function emptyDraft(): ApplicationInput {
  return { ...DEFAULT_APPLICATION_INPUT };
}

function sortApplications(items: Application[]) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.updatedAt).getTime();
    const bDate = new Date(b.updatedAt).getTime();
    return bDate - aDate;
  });
}

export default function ApplicationsTracker({ initialApplications, userId }: Props) {
  const { lang } = useLanguage();
  const t = SITE_COPY[lang].applications;
  const [applications, setApplications] = useState<Application[]>(() => sortApplications(initialApplications));
  const [selectedId, setSelectedId] = useState<string | "new">(
    initialApplications[0]?.id ?? "new",
  );
  const [draft, setDraft] = useState<ApplicationInput>(() =>
    initialApplications[0]
      ? applicationToInput(initialApplications[0])
      : emptyDraft(),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deleteState, setDeleteState] = useState<"idle" | "deleting" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setApplications(sortApplications(initialApplications));
    if (initialApplications.length === 0) {
      setSelectedId("new");
      setDraft(emptyDraft());
      return;
    }

    setSelectedId((current) =>
      current !== "new" && initialApplications.some((item) => item.id === current)
        ? current
        : initialApplications[0].id,
    );
  }, [initialApplications]);

  useEffect(() => {
    if (selectedId === "new") {
      setDraft(emptyDraft());
      return;
    }

    const current = applications.find((item) => item.id === selectedId);
    if (current) {
      setDraft(applicationToInput(current));
    }
  }, [applications, selectedId]);

  const filteredApplications = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return applications.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (!lowered) {
        return true;
      }

      return [
        item.companyName,
        item.roleTitle,
        item.sourceSite,
        item.notes,
        item.contactName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(lowered);
    });
  }, [applications, query, statusFilter]);

  const summaryCounts = useMemo(() => {
    return APPLICATION_STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = applications.filter((item) => item.status === status).length;
        return acc;
      },
      {} as Record<ApplicationStatus, number>,
    );
  }, [applications]);

  const selectedApplication =
    selectedId === "new"
      ? null
      : applications.find((item) => item.id === selectedId) ?? null;

  async function handleSave() {
    if (!userId) {
      return;
    }

    setSaveState("saving");
    setStatusMessage("");

    try {
      const supabase = createClient();
      const payload = applicationInputToDb(draft);

      if (selectedId === "new") {
        const { data, error } = await supabase
          .from("applications")
          .insert([{ user_id: userId, ...payload }])
          .select("*")
          .single<DbApplication>();

        if (error || !data) {
          throw error ?? new Error("insert_failed");
        }

        const created = dbApplicationToApplication(data);
        const next = sortApplications([created, ...applications]);
        setApplications(next);
        setSelectedId(created.id);
      } else {
        const { data, error } = await supabase
          .from("applications")
          .update(payload)
          .eq("id", selectedId)
          .eq("user_id", userId)
          .select("*")
          .single<DbApplication>();

        if (error || !data) {
          throw error ?? new Error("update_failed");
        }

        const updated = dbApplicationToApplication(data);
        const next = sortApplications(
          applications.map((item) => (item.id === updated.id ? updated : item)),
        );
        setApplications(next);
        setSelectedId(updated.id);
      }

      setSaveState("saved");
      setStatusMessage(t.created);
    } catch (error) {
      console.error("Failed to save application", error);
      setSaveState("error");
      setStatusMessage(t.saveError);
    }
  }

  async function handleDelete() {
    if (!userId || selectedId === "new") {
      return;
    }

    const confirmed = window.confirm(
      lang === "ja"
        ? "この応募履歴を削除しますか？"
        : "Delete this application entry?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteState("deleting");
    setStatusMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", selectedId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const remaining = applications.filter((item) => item.id !== selectedId);
      setApplications(sortApplications(remaining));
      setSelectedId(remaining[0]?.id ?? "new");
      setDraft(remaining[0] ? applicationToInput(remaining[0]) : emptyDraft());
      setDeleteState("idle");
      setStatusMessage(t.deleted);
    } catch (error) {
      console.error("Failed to delete application", error);
      setDeleteState("error");
      setStatusMessage(t.deleteError);
    }
  }

  function handleReset() {
    setStatusMessage("");
    setSaveState("idle");
    setDeleteState("idle");

    if (selectedApplication) {
      setDraft(applicationToInput(selectedApplication));
      return;
    }

    setDraft(emptyDraft());
  }

  function startNew() {
    setSelectedId("new");
    setDraft(emptyDraft());
    setStatusMessage("");
    setSaveState("idle");
    setDeleteState("idle");
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              {t.summaryTitle}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted">
              {t.summarySubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={startNew}
            className="primary-cta-button h-11 px-5 text-sm"
          >
            {t.newButton}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {APPLICATION_STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                statusFilter === status
                  ? "border-brand bg-brand/10 shadow-[0_12px_28px_rgba(77,127,181,0.12)]"
                  : "border-white/60 bg-white/42 hover:border-brand-line"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                {statusLabel(status, t.statuses)}
              </div>
              <div className="mt-2 text-3xl font-bold leading-none tracking-tight text-brand-ink">
                {summaryCounts[status]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.8fr)]">
        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-brand-ink">{t.listTitle}</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-11 rounded-xl border border-brand-line/70 bg-white/78 px-4 text-sm text-brand-ink outline-none transition-colors placeholder:text-brand-muted/70 focus:border-brand"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as FilterValue)}
                className="h-11 rounded-xl border border-brand-line/70 bg-white/78 px-4 text-sm text-brand-ink outline-none transition-colors focus:border-brand"
              >
                <option value="all">{t.filterAll}</option>
                {APPLICATION_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status, t.statuses)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-line bg-white/34 px-5 py-8 text-center">
                <p className="text-lg font-semibold text-brand-ink">{t.emptyTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{t.emptyDesc}</p>
              </div>
            ) : (
              filteredApplications.map((item) => {
                const active = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition-all ${
                      active
                        ? "border-brand bg-white/88 shadow-[0_18px_40px_rgba(77,127,181,0.12)]"
                        : "border-white/62 bg-white/52 hover:border-brand-line"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-brand-ink">{item.companyName || "—"}</div>
                        <div className="mt-1 text-sm text-brand-muted">
                          {item.roleTitle || "—"}
                        </div>
                      </div>
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {statusLabel(item.status, t.statuses)}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-brand-muted sm:grid-cols-2">
                      <div>{item.sourceSite || "—"}</div>
                      <div>{item.appliedAt || "—"}</div>
                      <div className="sm:col-span-2 line-clamp-2">{item.notes || "—"}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand-ink">
              {selectedId === "new" ? t.createTitle : t.editTitle}
            </h2>
            {statusMessage ? (
              <span className="text-xs font-medium text-brand-muted">{statusMessage}</span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4">
            <Field
              label={t.fields.companyName}
              value={draft.companyName}
              onChange={(value) => setDraft((prev) => ({ ...prev, companyName: value }))}
            />
            <Field
              label={t.fields.roleTitle}
              value={draft.roleTitle}
              onChange={(value) => setDraft((prev) => ({ ...prev, roleTitle: value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.fields.sourceSite}
                value={draft.sourceSite}
                onChange={(value) => setDraft((prev) => ({ ...prev, sourceSite: value }))}
              />
              <Field
                label={t.fields.status}
                value={draft.status}
                onChange={(value) => setDraft((prev) => ({ ...prev, status: value as ApplicationStatus }))}
                as="select"
              >
                {APPLICATION_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status, t.statuses)}
                  </option>
                ))}
              </Field>
            </div>
            <Field
              label={t.fields.applicationUrl}
              value={draft.applicationUrl}
              onChange={(value) => setDraft((prev) => ({ ...prev, applicationUrl: value }))}
              type="url"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.fields.appliedAt}
                value={draft.appliedAt}
                onChange={(value) => setDraft((prev) => ({ ...prev, appliedAt: value }))}
                type="date"
              />
              <Field
                label={t.fields.nextStepAt}
                value={draft.nextStepAt}
                onChange={(value) => setDraft((prev) => ({ ...prev, nextStepAt: value }))}
                type="date"
              />
            </div>
            <Field
              label={t.fields.nextStepLabel}
              value={draft.nextStepLabel}
              onChange={(value) => setDraft((prev) => ({ ...prev, nextStepLabel: value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.fields.contactName}
                value={draft.contactName}
                onChange={(value) => setDraft((prev) => ({ ...prev, contactName: value }))}
              />
              <Field
                label={t.fields.contactEmail}
                value={draft.contactEmail}
                onChange={(value) => setDraft((prev) => ({ ...prev, contactEmail: value }))}
                type="email"
              />
            </div>
            <Field
              label={t.fields.notes}
              value={draft.notes}
              onChange={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
              as="textarea"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                handleSave().catch(() => {});
              }}
              disabled={saveState === "saving"}
              className="primary-cta-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState === "saving" ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="glass-button-secondary h-11 px-5 text-sm font-medium"
            >
              {t.reset}
            </button>
            {selectedId !== "new" ? (
              <button
                type="button"
                onClick={() => {
                  handleDelete().catch(() => {});
                }}
                disabled={deleteState === "deleting"}
                className="inline-flex h-11 items-center rounded-xl border border-[#efc6d2] bg-white/70 px-5 text-sm font-medium text-[#96526a] transition-colors hover:border-[#d988a5] hover:text-[#7d4057] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteState === "deleting" ? t.deleting : t.delete}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function applicationToInput(application: Application): ApplicationInput {
  return {
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    sourceSite: application.sourceSite,
    applicationUrl: application.applicationUrl,
    status: application.status,
    appliedAt: application.appliedAt,
    nextStepLabel: application.nextStepLabel,
    nextStepAt: application.nextStepAt,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
    notes: application.notes,
  };
}

function statusLabel(
  status: ApplicationStatus,
  labels: Readonly<Record<ApplicationStatus, string>>,
) {
  return labels[status];
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  as?: "input" | "textarea" | "select";
  children?: ReactNode;
}) {
  const baseClassName =
    "w-full rounded-xl border border-brand-line/70 bg-white/78 px-4 text-sm text-brand-ink outline-none transition-colors placeholder:text-brand-muted/70 focus:border-brand";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-brand-muted">{label}</span>
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${baseClassName} py-3`}
        />
      ) : as === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClassName} h-11`}
        >
          {children}
        </select>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          className={`${baseClassName} h-11`}
        />
      )}
    </label>
  );
}
