import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

type PracticeLoopPayload = {
  loopSlug: string;
  sceneId: string;
  sceneTitle: string;
  adviceIds: string[];
  effectId: string | null;
  identity: string;
  reframe: string;
  knowledge: {
    title: string;
    body: string;
    line: string;
  };
  environment: string;
  action: string;
  reminder: string;
  createdAt: string;
};

type IkeaWorksheetResponse = {
  id: string;
  struggle?: string;
  identity?: string;
  tinyAction?: string;
  knowledge?: string;
  environment?: {
    prompt?: string;
    reminder?: string;
    loopSlug?: string;
    sceneId?: string;
    sceneTitle?: string;
    originalIdentity?: string;
    source?: string;
    createdAt?: string;
  };
  created_at?: string | null;
};

const toSavedPractice = (worksheet: IkeaWorksheetResponse) => ({
  id: worksheet.id,
  moment: worksheet.struggle || worksheet.environment?.sceneTitle || "",
  identity: worksheet.identity || "",
  oldStory: worksheet.environment?.originalIdentity || "",
  knowledge: worksheet.knowledge || "",
  environment: worksheet.environment?.prompt || "",
  action: worksheet.tinyAction || "",
  reminder: worksheet.environment?.reminder || "",
  loopSlug: worksheet.environment?.loopSlug || "practice",
  sceneId: worksheet.environment?.sceneId || null,
  createdAt: worksheet.created_at || worksheet.environment?.createdAt || null,
});

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE_URL}/api/ikea/worksheet/active`, {
      method: "GET",
      headers: { Cookie: cookie },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(toSavedPractice(data), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/practice/loops:", error);
    return NextResponse.json(
      { detail: "Could not load your current practice." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const payload = (await req.json()) as PracticeLoopPayload;

    const res = await fetch(`${API_BASE_URL}/api/ikea/worksheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        struggle: payload.sceneTitle,
        identity: payload.reframe,
        knowledge: [
          payload.knowledge.title,
          payload.knowledge.body,
          payload.knowledge.line,
        ]
          .filter(Boolean)
          .join("\n\n"),
        environment: {
          prompt: payload.environment,
          loopSlug: payload.loopSlug,
          sceneId: payload.sceneId,
          sceneTitle: payload.sceneTitle,
          adviceIds: payload.adviceIds,
          effectId: payload.effectId,
          reminder: payload.reminder,
          originalIdentity: payload.identity,
          source: "practice",
          version: 1,
          createdAt: payload.createdAt,
        },
        tinyAction: payload.action,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error in POST /api/practice/loops:", error);
    return NextResponse.json(
      { detail: "Could not keep this practice yet." },
      { status: 500 },
    );
  }
}
