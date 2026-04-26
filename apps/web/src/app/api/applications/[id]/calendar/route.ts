import { NextResponse } from "next/server";
import { dbApplicationToApplication, type DbApplication } from "@cygnet/shared";
import {
  decryptGoogleRefreshToken,
  refreshGoogleWorkspaceAccessToken,
  upsertGoogleCalendarEvent,
} from "@/lib/google-workspace";
import { getGoogleWorkspaceIntegrationRow } from "@/lib/applications/gmail-sync";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const [{ data, error }, integration] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single<DbApplication>(),
    getGoogleWorkspaceIntegrationRow(supabase, user.id),
  ]);

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!integration) {
    return NextResponse.json({ error: "google_not_connected" }, { status: 400 });
  }

  try {
    const application = dbApplicationToApplication(data);
    const hadExistingEvent = Boolean(application.calendarEventId);
    const refreshToken = decryptGoogleRefreshToken(integration.refresh_token_encrypted);
    const token = await refreshGoogleWorkspaceAccessToken(refreshToken);
    const event = await upsertGoogleCalendarEvent(token.access_token, application);

    const { data: updated, error: updateError } = await supabase
      .from("applications")
      .update({
        calendar_provider: "google",
        calendar_event_id: event.id,
        calendar_event_url: event.htmlLink,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single<DbApplication>();

    if (updateError || !updated) {
      throw updateError ?? new Error("calendar_update_failed");
    }

    return NextResponse.json({
      ok: true,
      application: dbApplicationToApplication(updated),
      eventUrl: event.htmlLink,
      updated: hadExistingEvent,
    });
  } catch (routeError) {
    return NextResponse.json(
      { error: routeError instanceof Error ? routeError.message : String(routeError) },
      { status: 400 },
    );
  }
}
