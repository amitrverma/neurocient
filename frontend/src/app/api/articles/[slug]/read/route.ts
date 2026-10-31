import { NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // ✅ await params
    const cookie = req.headers.get("cookie") || "";
    const backendPath = `/articles/${slug}/read`;

    const res = await fetch(
      `${process.env.API_BASE_URL}${backendPath}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie, ...mutationProxyHeaders(req, backendPath) },
        credentials: "include",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying /articles/[slug]/read:", err);
    return NextResponse.json(
      { detail: "Failed to increment read count" },
      { status: 500 }
    );
  }
}
