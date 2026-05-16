const LEGACY_UPLOAD_HOST = "167.99.147.85";

export function getTokenImageSrc(image: string | null | undefined): string {
  if (!image) return "";

  try {
    const url = new URL(image);
    if (
      url.protocol === "http:" &&
      url.hostname === LEGACY_UPLOAD_HOST &&
      url.pathname.startsWith("/uploads/")
    ) {
      const params = new URLSearchParams({ url: image });
      return `/api/token-image?${params.toString()}`;
    }
  } catch {
    return image;
  }

  return image;
}
