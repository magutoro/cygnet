import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@cygnet/shared";

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

function cleanText(value: string): string {
  return value.replace(/\r/g, "").replace(/\u3000/g, " ").replace(/[ \t]+/g, " ").trim();
}

function stripLabelNoise(value: string): string {
  return cleanText(
    value
      .replace(/^[:：\s-]+/, "")
      .replace(/[（(].*?[)）]/g, " ")
      .replace(/\s+/g, " "),
  );
}

function splitName(value: string): Partial<Profile> {
  const cleaned = stripLabelNoise(value).replace(/^(氏名|名前)\s*/u, "").trim();
  if (!cleaned) return {};
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      lastNameKanji: parts[0],
      firstNameKanji: parts.slice(1).join(" "),
    };
  }
  return {};
}

function splitKanaName(value: string): Partial<Profile> {
  const cleaned = stripLabelNoise(value).replace(/^(フリガナ|ふりがな)\s*/u, "").trim();
  if (!cleaned) return {};
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      lastNameKana: parts[0],
      firstNameKana: parts.slice(1).join(" "),
    };
  }
  return {};
}

function findLabeledValue(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const inline = new RegExp(`${label}\\s*[:：]?\\s*([^\\n]{1,120})`, "iu");
    const inlineMatch = text.match(inline);
    if (inlineMatch?.[1]) return stripLabelNoise(inlineMatch[1]);

    const nextLine = new RegExp(`${label}\\s*[:：]?\\s*\\n\\s*([^\\n]{1,120})`, "iu");
    const nextLineMatch = text.match(nextLine);
    if (nextLineMatch?.[1]) return stripLabelNoise(nextLineMatch[1]);
  }

  return null;
}

function formatDate(year: string, month: string, day: string): string {
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatYearMonth(year: string, month: string): string {
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}`;
}

function extractBasicProfileFromText(rawText: string): Partial<Profile> {
  const text = cleanText(rawText);
  const profile: Partial<Profile> = {};

  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu)?.[0];
  if (email) profile.email = email;

  const postal = text.match(/(?:〒\s*)?(\d{3})[-−ー]?(\d{4})/u);
  if (postal) profile.postalCode = `${postal[1]}-${postal[2]}`;

  const phone = text.match(/0\d{1,4}[-−ー]\d{1,4}[-−ー]\d{3,4}/u)?.[0];
  if (phone) profile.phone = phone.replace(/[−ー]/g, "-");

  const birth =
    text.match(/生年月日[^\d]{0,12}(\d{4})\D{0,3}(\d{1,2})\D{0,3}(\d{1,2})/u) ||
    text.match(/(\d{4})\D{0,3}(\d{1,2})\D{0,3}(\d{1,2})\s*(?:生|生まれ)/u);
  if (birth) profile.birthDate = formatDate(birth[1], birth[2], birth[3]);

  const graduation =
    text.match(/(?:卒業(?:予定|見込|見込み)?|修了(?:予定|見込|見込み)?|卒業年月)[^\d]{0,12}(\d{4})\D{0,3}(\d{1,2})/u) ||
    text.match(/(\d{4})\D{0,3}(\d{1,2})\s*(?:卒業|修了)/u);
  if (graduation) profile.graduationYear = formatYearMonth(graduation[1], graduation[2]);

  const fullName = findLabeledValue(text, ["氏名", "名前"]);
  if (fullName) Object.assign(profile, splitName(fullName));

  const kanaName = findLabeledValue(text, ["フリガナ", "ふりがな", "氏名\\(フリガナ\\)", "氏名（フリガナ）"]);
  if (kanaName) Object.assign(profile, splitKanaName(kanaName));

  const preferredName = findLabeledValue(text, ["通称名", "希望名", "Preferred Name"]);
  if (preferredName) profile.preferredName = preferredName;

  const university =
    findLabeledValue(text, ["学校名", "大学名", "最終学歴"]) ||
    text.match(/([^\n]{2,50}?大学(?:院)?)/u)?.[1];
  if (university) profile.university = stripLabelNoise(university);

  const faculty = text.match(/([^\n]{1,40}?学部)/u)?.[1];
  if (faculty) profile.faculty = stripLabelNoise(faculty);

  const department = text.match(/([^\n]{1,50}?(?:学科|研究科|専攻))/u)?.[1];
  if (department) profile.department = stripLabelNoise(department);

  const addressValue = findLabeledValue(text, ["住所", "現住所"]);
  if (addressValue) {
    const pref = PREFECTURES.find((item) => addressValue.includes(item));
    if (pref) {
      profile.prefecture = pref;
      const rest = addressValue.slice(addressValue.indexOf(pref) + pref.length).trim();
      profile.addressLine1 = rest || addressValue;
    } else {
      profile.addressLine1 = addressValue;
    }
  }

  return profile;
}

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
        { error: dlError?.message || "Failed to download file" },
        { status: 500 },
      );
    }

    let rawText = "";
    try {
      const arrayBuffer = await fileData.arrayBuffer();

      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
      const result = await parser.getText();
      rawText = result.text;
      await parser.destroy();
    } catch (error) {
      console.error("Resume PDF text extraction failed", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Failed to read PDF text: ${error.message}`
              : "Failed to read PDF text",
        },
        { status: 422 },
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "No readable text was found in this PDF. Try a text-based PDF 履歴書 instead of a scanned image.",
        },
        { status: 422 },
      );
    }

    let profile: Partial<Profile> = extractBasicProfileFromText(rawText);

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
      } catch (error) {
        console.error("OpenAI resume parsing failed, falling back to basic extraction", error);
      }
    }

    return NextResponse.json({ profile, rawText });
  } catch (error) {
    console.error("Resume parse route failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
