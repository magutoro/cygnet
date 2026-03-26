import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@cygnet/shared";

export async function POST(request: Request) {
  try {
    const { storagePath } = await request.json();

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json(
        { error: "storagePath is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!storagePath.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: fileData, error: dlError } = await supabase.storage
      .from("resumes")
      .download(storagePath);

    if (dlError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 },
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    const result = await parser.getText();
    const rawText = result.text;
    await parser.destroy();

    let profile: Partial<Profile> = {};

    if (process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                'You extract structured data from resume text. Return a JSON object with only the fields you can confidently extract. Field names: lastNameKanji, firstNameKanji, lastNameKana, firstNameKana, lastNameEnglish, firstNameEnglish, email, phone, postalCode, prefecture, city, addressLine1, addressLine2, birthDate (YYYY-MM-DD), university, faculty, department, humanitiesScienceType, graduationYear (prefer YYYY-MM when month is available), company, linkedIn, github, portfolio. The resume may be in Japanese or English. Only include fields you are confident about — omit uncertain fields.',
            },
            {
              role: "user",
              content: `Extract profile fields from this resume:\n\n${rawText.slice(0, 8000)}`,
            },
          ],
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validKeys = new Set([
            "lastNameKanji",
            "firstNameKanji",
            "lastNameKana",
            "firstNameKana",
            "lastNameEnglish",
            "firstNameEnglish",
            "email",
            "phone",
            "postalCode",
            "prefecture",
            "city",
            "addressLine1",
            "addressLine2",
            "birthDate",
            "university",
            "faculty",
            "department",
            "humanitiesScienceType",
            "graduationYear",
            "company",
            "linkedIn",
            "github",
            "portfolio",
          ]);

          for (const [key, value] of Object.entries(parsed)) {
            if (validKeys.has(key) && typeof value === "string" && value) {
              (profile as Record<string, string>)[key] = value;
            }
          }
        }
      } catch {
        // OpenAI parsing failed — fall back to raw text only
      }
    }

    return NextResponse.json({ profile, rawText });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
