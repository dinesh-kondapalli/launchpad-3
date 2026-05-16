import { NextRequest, NextResponse } from "next/server";

const LEGACY_UPLOAD_HOST = "167.99.147.85";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");
  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (
    url.protocol !== "http:" ||
    url.hostname !== LEGACY_UPLOAD_HOST ||
    !url.pathname.startsWith("/uploads/")
  ) {
    return NextResponse.json({ error: "Invalid image source" }, { status: 400 });
  }

  const upstream = await fetch(url, { next: { revalidate: 31_536_000 } });
  const contentType = upstream.headers.get("content-type") ?? "";

  if (!upstream.ok || !upstream.body || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Image not found" }, { status: upstream.status || 404 });
  }

  const headers = new Headers();
  headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
