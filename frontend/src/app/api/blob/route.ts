import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob token is not configured" }, { status: 500 });
  }

  const blobUrl = req.nextUrl.searchParams.get("url");
  if (!blobUrl) {
    return NextResponse.json({ error: "Missing blob URL" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(blobUrl);
  } catch {
    return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  if (url.protocol !== "https:" || !url.hostname.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid blob host" }, { status: 400 });
  }

  if (!url.pathname.startsWith("/tokens/")) {
    return NextResponse.json({ error: "Invalid blob path" }, { status: 400 });
  }

  const upstream = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Blob not found" }, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
