import { BACKEND_URL } from "api/apiClient";

/**
 * Resolve a stored media path to a browser-accessible URL.
 * Supports Cloudinary HTTPS URLs and legacy MinIO-relative keys.
 */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null;

  const value = String(pathOrUrl).trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  const normalized = value.replace(/^\/+/, "");
  return `${BACKEND_URL}/${normalized}`;
}
