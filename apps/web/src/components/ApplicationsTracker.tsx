"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  APPLICATION_STATUS_ORDER,
  DEFAULT_APPLICATION_INPUT,
  applicationInputToDb,
  dbApplicationToApplication,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type DbApplication,
  type GoogleWorkspaceIntegrationSummary,
} from "@cygnet/shared";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { SITE_COPY } from "@/content/site-copy";

const WORKSPACE_OAUTH_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_OAUTH_ENABLED === "true";

interface Props {
  initialApplications: Application[];
  initialIntegration: GoogleWorkspaceIntegrationSummary;
  userId: string;
}

type FilterValue = "all" | ApplicationStatus;

interface CalendarDay {
  key: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  items: Application[];
}

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

function sortScheduleItems(items: Application[]) {
  return [...items].sort((a, b) => {
    const aKey = `${a.nextStepAt} ${a.nextStepStartTime || "99:99"}`;
    const bKey = `${b.nextStepAt} ${b.nextStepStartTime || "99:99"}`;
    return aKey.localeCompare(bKey);
  });
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
    nextStepStartTime: application.nextStepStartTime,
    nextStepEndTime: application.nextStepEndTime,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
    notes: application.notes,
    captureSource: application.captureSource,
    gmailThreadId: application.gmailThreadId,
    gmailMessageId: application.gmailMessageId,
    calendarProvider: application.calendarProvider,
    calendarEventId: application.calendarEventId,
    calendarEventUrl: application.calendarEventUrl,
  };
}

function statusLabel(
  status: ApplicationStatus,
  labels: Readonly<Record<ApplicationStatus, string>>,
) {
  return labels[status];
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function todayString() {
  return formatDateKey(new Date());
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateFromMonthKey(key: string): Date {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getInitialSelectedDate(items: Application[]): string {
  const today = todayString();
  const scheduled = sortScheduleItems(items.filter((item) => item.nextStepAt));
  if (scheduled.some((item) => item.nextStepAt === today)) return today;
  const upcoming = scheduled.find((item) => item.nextStepAt >= today);
  if (upcoming?.nextStepAt) return upcoming.nextStepAt;
  return scheduled[0]?.nextStepAt || today;
}

function buildCalendarDays(
  visibleMonth: Date,
  scheduledMap: Map<string, Application[]>,
): CalendarDay[] {
  const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const today = todayString();
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = formatDateKey(current);
    days.push({
      key,
      dayNumber: current.getDate(),
      inMonth: current.getMonth() === visibleMonth.getMonth(),
      isToday: key === today,
      items: scheduledMap.get(key) ?? [],
    });
  }

  return days;
}

function formatMonthLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(dateFromMonthKey(value));
}

function shiftMonth(value: string, delta: number) {
  const next = dateFromMonthKey(value);
  next.setMonth(next.getMonth() + delta);
  return monthKey(next);
}

function formatScheduleTime(item: Application, locale: string): string {
  if (!item.nextStepStartTime) return "";
  if (!item.nextStepEndTime) return item.nextStepStartTime;
  return `${item.nextStepStartTime} – ${item.nextStepEndTime}`;
}

function updateApplicationInList(items: Application[], next: Application) {
  return sortApplications(items.map((item) => (item.id === next.id ? next : item)));
}

export default function ApplicationsTracker({
  initialApplications,
  initialIntegration,
  userId,
}: Props) {
  const { lang } = useLanguage();
  const locale = lang === "ja" ? "ja-JP" : "en-US";
  const t = SITE_COPY[lang].applications;

  const [applications, setApplications] = useState<Application[]>(() =>
    sortApplications(initialApplications),
  );
  const [integration, setIntegration] = useState<GoogleWorkspaceIntegrationSummary>(
    initialIntegration,
  );
  const [selectedId, setSelectedId] = useState<string | "new">(
    initialApplications[0]?.id ?? "new",
  );
  const [draft, setDraft] = useState<ApplicationInput>(() =>
    initialApplications[0] ? applicationToInput(initialApplications[0]) : emptyDraft(),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deleteState, setDeleteState] = useState<"idle" | "deleting" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [integrationBusy, setIntegrationBusy] = useState(false);
  const [autoCalendarBusy, setAutoCalendarBusy] = useState(false);
  const [calendarBusyId, setCalendarBusyId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => getInitialSelectedDate(initialApplications));
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthKey(parseLocalDate(getInitialSelectedDate(initialApplications))),
  );
  const autoSyncStartedRef = useRef(false);

  useEffect(() => {
    const nextApplications = sortApplications(initialApplications);
    setApplications(nextApplications);
    setIntegration(initialIntegration);
    if (nextApplications.length === 0) {
      setSelectedId("new");
      setDraft(emptyDraft());
      return;
    }

    setSelectedId((current) =>
      current !== "new" && nextApplications.some((item) => item.id === current)
        ? current
        : nextApplications[0].id,
    );
  }, [initialApplications, initialIntegration]);

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

      if (!lowered) return true;

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

  const scheduledApplications = useMemo(
    () =>
      sortScheduleItems(
        applications.filter((item) => item.nextStepAt && item.status !== "rejected" && item.status !== "withdrawn"),
      ),
    [applications],
  );

  const scheduledMap = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const item of scheduledApplications) {
      if (!item.nextStepAt) continue;
      const current = map.get(item.nextStepAt) ?? [];
      current.push(item);
      map.set(item.nextStepAt, sortScheduleItems(current));
    }
    return map;
  }, [scheduledApplications]);

  const calendarDays = useMemo(
    () => buildCalendarDays(dateFromMonthKey(visibleMonth), scheduledMap),
    [scheduledMap, visibleMonth],
  );

  const selectedDayApplications = useMemo(
    () => scheduledMap.get(selectedDate) ?? [],
    [scheduledMap, selectedDate],
  );

  const overdueApplications = useMemo(() => {
    const today = todayString();
    return scheduledApplications.filter((item) => item.nextStepAt < today).slice(0, 4);
  }, [scheduledApplications]);

  const upcomingApplications = useMemo(() => {
    const today = todayString();
    return scheduledApplications.filter((item) => item.nextStepAt >= today).slice(0, 4);
  }, [scheduledApplications]);

  const selectedApplication =
    selectedId === "new"
      ? null
      : applications.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!integration.connected || !userId || autoSyncStartedRef.current) return;
    autoSyncStartedRef.current = true;
    handleSyncGmail(true).catch(() => {});
  }, [integration.connected, userId]);

  async function handleSave() {
    if (!userId) return;

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
        const nextApplications = sortApplications([created, ...applications]);
        setApplications(nextApplications);
        setSelectedId(created.id);
        setStatusMessage(t.created);
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
        const nextApplications = updateApplicationInList(applications, updated);
        setApplications(nextApplications);
        setSelectedId(updated.id);
        setStatusMessage(t.updated);
      }

      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save application", error);
      setSaveState("error");
      setStatusMessage(t.saveError);
    }
  }

  async function handleDelete() {
    if (!userId || selectedId === "new") return;

    const confirmed = window.confirm(
      lang === "ja" ? "この応募履歴を削除しますか？" : "Delete this application entry?",
    );
    if (!confirmed) return;

    setDeleteState("deleting");
    setStatusMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", selectedId)
        .eq("user_id", userId);

      if (error) throw error;

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

  async function handleSyncGmail(silent = false) {
    if (!integration.connected) {
      if (!WORKSPACE_OAUTH_ENABLED) {
        setStatusMessage(t.googleUnavailableDesc);
        return;
      }
      window.location.href = "/api/integrations/google/connect";
      return;
    }

    if (!silent) {
      setIntegrationBusy(true);
      setStatusMessage(t.gmailSyncing);
    }

    try {
      const response = await fetch("/api/applications/gmail/sync", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        applications?: Application[];
        integration?: GoogleWorkspaceIntegrationSummary;
        importedCount?: number;
        updatedCount?: number;
        calendarSyncedCount?: number;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.applications || !payload.integration) {
        throw new Error(payload.error || t.gmailSyncError);
      }

      setApplications(sortApplications(payload.applications));
      setIntegration(payload.integration);
      setStatusMessage(
        t.gmailSyncResult
          .replace("{imported}", String(payload.importedCount ?? 0))
          .replace("{updated}", String(payload.updatedCount ?? 0))
          .replace("{calendar}", String(payload.calendarSyncedCount ?? 0)),
      );
    } catch (error) {
      console.error("Failed to sync Gmail", error);
      if (!silent) {
        setStatusMessage(
          `${t.gmailSyncError}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } finally {
      if (!silent) {
        setIntegrationBusy(false);
      }
    }
  }

  async function handleAutoCalendarChange(enabled: boolean) {
    if (!integration.connected) return;

    setAutoCalendarBusy(true);
    setStatusMessage(t.autoCalendarSaving);

    try {
      const response = await fetch("/api/integrations/google/auto-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        integration?: GoogleWorkspaceIntegrationSummary;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.integration) {
        throw new Error(payload.error || t.autoCalendarError);
      }

      setIntegration(payload.integration);
      setStatusMessage(t.autoCalendarSaved);
    } catch (error) {
      console.error("Failed to update auto calendar sync", error);
      setStatusMessage(
        `${t.autoCalendarError}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setAutoCalendarBusy(false);
    }
  }

  async function handleCalendarSync() {
    if (!selectedApplication) return;
    if (!integration.connected) {
      if (!WORKSPACE_OAUTH_ENABLED) {
        setStatusMessage(t.googleUnavailableDesc);
        return;
      }
      window.location.href = "/api/integrations/google/connect";
      return;
    }

    setCalendarBusyId(selectedApplication.id);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/applications/${selectedApplication.id}/calendar`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        application?: Application;
        updated?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.application) {
        throw new Error(payload.error || t.calendarError);
      }

      const nextApplications = updateApplicationInList(applications, payload.application);
      setApplications(nextApplications);
      if (selectedId === payload.application.id) {
        setDraft(applicationToInput(payload.application));
      }
      setStatusMessage(payload.updated ? t.calendarUpdated : t.calendarSaved);
    } catch (error) {
      console.error("Failed to sync calendar event", error);
      setStatusMessage(
        `${t.calendarError}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setCalendarBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.72fr)]">
        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                {t.scheduleTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {t.scheduleSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
                className="glass-button-secondary h-10 px-4 text-sm font-medium"
              >
                {t.prevMonth}
              </button>
              <div className="rounded-xl border border-white/70 bg-white/58 px-4 py-2 text-sm font-semibold text-brand-ink">
                {formatMonthLabel(visibleMonth, locale)}
              </div>
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
                className="glass-button-secondary h-10 px-4 text-sm font-medium"
              >
                {t.nextMonth}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
            {t.weekdays.map((weekday) => (
              <div key={weekday}>{weekday}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const active = day.key === selectedDate;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.key);
                    setVisibleMonth(monthKey(parseLocalDate(day.key)));
                  }}
                  className={`min-h-[92px] rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? "border-brand bg-white/88 shadow-[0_18px_38px_rgba(77,127,181,0.12)]"
                      : day.inMonth
                        ? "border-white/62 bg-white/50 hover:border-brand-line"
                        : "border-white/40 bg-white/24 text-brand-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        day.isToday ? "text-brand" : "text-brand-ink"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.items.length ? (
                      <span className="rounded-full bg-brand/12 px-2 py-1 text-[11px] font-semibold text-brand">
                        {day.items.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-1">
                    {day.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="truncate rounded-full bg-brand-strong/10 px-2 py-1 text-[11px] font-medium text-brand-ink"
                      >
                        {item.companyName || item.nextStepLabel || "—"}
                      </div>
                    ))}
                    {day.items.length > 2 ? (
                      <div className="text-[11px] font-medium text-brand-muted">
                        +{day.items.length - 2}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              {t.agendaTitle}
            </p>
            <div className="mt-4">
              <div className="text-lg font-semibold text-brand-ink">
                {new Intl.DateTimeFormat(locale, {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                }).format(parseLocalDate(selectedDate))}
              </div>
              <div className="mt-4 space-y-3">
                {selectedDayApplications.length === 0 ? (
                  <p className="text-sm text-brand-muted">{t.noAgenda}</p>
                ) : (
                  selectedDayApplications.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/60 bg-white/52 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-brand-ink">
                            {item.companyName || "—"}
                          </div>
                          <div className="mt-1 text-xs text-brand-muted">
                            {item.nextStepLabel || item.roleTitle || "—"}
                          </div>
                        </div>
                        {formatScheduleTime(item, locale) ? (
                          <span className="rounded-full bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand">
                            {formatScheduleTime(item, locale)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <StatusSection
                title={t.upcomingTitle}
                emptyLabel={t.noUpcoming}
                items={upcomingApplications}
                locale={locale}
              />
              <StatusSection
                title={t.overdueTitle}
                emptyLabel={t.noOverdue}
                items={overdueApplications}
                locale={locale}
              />
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              {t.googleTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {integration.connected
                ? t.googleConnectedDesc
                : WORKSPACE_OAUTH_ENABLED
                  ? t.googleDesc
                  : t.googleUnavailableDesc}
            </p>
            <div className="mt-4 rounded-2xl border border-white/65 bg-[rgba(255,255,255,0.46)] px-4 py-3 text-xs leading-relaxed text-brand-muted">
              {t.googleFounderNote}
            </div>

            <div className="mt-4 rounded-2xl border border-white/65 bg-white/52 p-4">
              <div className="text-sm font-semibold text-brand-ink">
                {integration.connected ? integration.googleEmail || t.googleConnected : t.googleNotConnected}
              </div>
              <div className="mt-1 text-xs text-brand-muted">
                {t.googleLabelValue.replace("{label}", integration.labelName || "Cygnet")}
              </div>
              {integration.lastSyncedAt ? (
                <div className="mt-1 text-xs text-brand-muted">
                  {t.googleLastSynced.replace(
                    "{date}",
                    new Intl.DateTimeFormat(locale, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(integration.lastSyncedAt)),
                  )}
                </div>
              ) : null}
              {integration.lastSyncError ? (
                <div className="mt-2 text-xs text-[#8a4960]">{integration.lastSyncError}</div>
              ) : null}
            </div>

            {integration.connected ? (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/65 bg-white/46 p-4">
                <input
                  type="checkbox"
                  checked={integration.autoCalendarSyncEnabled}
                  onChange={(event) => {
                    handleAutoCalendarChange(event.target.checked).catch(() => {});
                  }}
                  disabled={autoCalendarBusy}
                  className="mt-1 h-4 w-4 rounded border-brand-line text-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-ink">
                    {t.autoCalendarToggle}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-brand-muted">
                    {integration.autoCalendarSyncEnabled
                      ? t.autoCalendarOn
                      : t.autoCalendarOff}
                  </span>
                </span>
              </label>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!integration.connected && !WORKSPACE_OAUTH_ENABLED) return;
                  window.location.href = integration.connected
                    ? "/settings"
                    : "/api/integrations/google/connect";
                }}
                disabled={!integration.connected && !WORKSPACE_OAUTH_ENABLED}
                className="primary-cta-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {integration.connected
                  ? t.googleManage
                  : WORKSPACE_OAUTH_ENABLED
                    ? t.googleConnect
                    : t.googleComingSoon}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSyncGmail(false).catch(() => {});
                }}
                disabled={!integration.connected || integrationBusy}
                className="glass-button-secondary h-11 px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {integrationBusy ? t.gmailSyncing : t.googleSyncNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.82fr)]">
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
                <button
                  type="button"
                  onClick={startNew}
                  className="primary-cta-button mt-5 h-11 px-5 text-sm"
                >
                  {t.newButton}
                </button>
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
                        <div className="text-lg font-semibold text-brand-ink">
                          {item.companyName || "—"}
                        </div>
                        <div className="mt-1 text-sm text-brand-muted">
                          {item.roleTitle || item.nextStepLabel || "—"}
                        </div>
                      </div>
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {statusLabel(item.status, t.statuses)}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-brand-muted sm:grid-cols-2">
                      <div>{item.sourceSite || "—"}</div>
                      <div>{item.nextStepAt || item.appliedAt || "—"}</div>
                      <div className="sm:col-span-2 line-clamp-2">{item.notes || "—"}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-brand-ink">
                {selectedId === "new" ? t.createTitle : t.editTitle}
              </h2>
              {statusMessage ? (
                <div className="mt-1 text-xs font-medium text-brand-muted">{statusMessage}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={startNew}
              className="glass-button-secondary h-11 px-4 text-sm font-medium"
            >
              {t.newButton}
            </button>
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
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, status: value as ApplicationStatus }))
                }
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.fields.nextStepStartTime}
                value={draft.nextStepStartTime}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, nextStepStartTime: value }))
                }
                type="time"
              />
              <Field
                label={t.fields.nextStepEndTime}
                value={draft.nextStepEndTime}
                onChange={(value) => setDraft((prev) => ({ ...prev, nextStepEndTime: value }))}
                type="time"
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

          {selectedApplication && selectedApplication.nextStepAt ? (
            <div className="mt-5 rounded-2xl border border-white/65 bg-white/48 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                {t.calendarActionsTitle}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleCalendarSync().catch(() => {});
                  }}
                  disabled={
                    calendarBusyId === selectedApplication.id ||
                    (!integration.connected && !WORKSPACE_OAUTH_ENABLED)
                  }
                  className="primary-cta-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {!integration.connected && !WORKSPACE_OAUTH_ENABLED
                    ? t.googleComingSoon
                    : calendarBusyId === selectedApplication.id
                    ? t.calendarSyncing
                    : selectedApplication.calendarEventId
                      ? t.updateGoogleCalendar
                      : t.addToGoogleCalendar}
                </button>
                <a
                  href={`/api/applications/${selectedApplication.id}/ics`}
                  className="glass-button-secondary inline-flex h-11 items-center px-5 text-sm font-medium"
                >
                  {t.downloadIcs}
                </a>
              </div>
            </div>
          ) : null}

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

function StatusSection({
  title,
  emptyLabel,
  items,
  locale,
}: {
  title: string;
  emptyLabel: string;
  items: Application[];
  locale: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line bg-white/32 px-4 py-5 text-sm text-brand-muted">
            {emptyLabel}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/65 bg-white/52 p-4">
              <div className="text-sm font-semibold text-brand-ink">{item.companyName || "—"}</div>
              <div className="mt-1 text-xs text-brand-muted">
                {item.nextStepLabel || item.roleTitle || "—"}
              </div>
              <div className="mt-2 text-xs font-medium text-brand">
                {new Intl.DateTimeFormat(locale, {
                  month: "short",
                  day: "numeric",
                }).format(parseLocalDate(item.nextStepAt))}
                {item.nextStepStartTime ? ` • ${formatScheduleTime(item, locale)}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
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
      <span className="mb-2 block text-sm font-medium text-brand-ink">{label}</span>
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
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClassName} h-11`}
        />
      )}
    </label>
  );
}
