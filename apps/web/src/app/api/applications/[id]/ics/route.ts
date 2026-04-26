import { NextResponse } from "next/server";
import { buildApplicationIcs, } from "@/lib/google-workspace";
import { dbApplicationToApplication, type DbApplication } from "@cygnet/shared";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<DbApplication>();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const application = dbApplicationToApplication(data);
    const ics = buildApplicationIcs(application);
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${application.companyName || "cygnet-application"}.ics"`,
      },
    });
  } catch (routeError) {
    return NextResponse.json(
      {
        error:
          routeError instanceof Error ? routeError.message : String(routeError),
      },
      { status: 400 },
    );
  }
}
