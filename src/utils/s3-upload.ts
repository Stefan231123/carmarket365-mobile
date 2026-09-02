import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/api';

/** Base URL for REST endpoints (strip the trailing `/graphql` from API_URL). */
const REST_BASE = API_URL.replace(/\/graphql\/?$/, '');

export interface S3UploadResult {
  /** Public URL of the uploaded object (what the backend wants in `createCarImage.url`). */
  url: string;
  /** Just the file name -- kept for the `fileName` metadata field on CarImage. */
  fileName: string;
  /** Byte size and MIME of the actual bytes uploaded (for the CarImage record). */
  fileSize: number;
  mimeType: string;
}

interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/** Pick a supported Content-Type from the URI / a fallback. Only JPEG/PNG/WEBP are accepted server-side. */
function contentTypeFor(uri: string, blobType?: string): string {
  const fromBlob = (blobType || '').toLowerCase();
  if (fromBlob === 'image/jpeg' || fromBlob === 'image/png' || fromBlob === 'image/webp') return fromBlob;
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

async function presign(kind: 'image' | 'avatar', fileName: string, contentType: string): Promise<PresignResponse> {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) throw new Error('Not signed in — please sign in and try again.');

  const res = await fetch(`${REST_BASE}/api/uploads/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ kind, fileName, contentType }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to get an upload URL (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<PresignResponse>;
}

async function putToS3(uploadUrl: string, blob: Blob, contentType: string, onProgress?: (p: number) => void): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`S3 upload failed with HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.timeout = 60000;
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(blob);
  });
}

export async function uploadImageToS3(
  uri: string,
  _carId: string, // kept for signature compatibility; presign is car-agnostic
  _apolloClient: unknown, // kept for signature compatibility
  onProgress?: (progress: number) => void,
): Promise<S3UploadResult> {
  const fileName = uri.split('/').pop() || 'photo.jpg';

  const blob = await (await fetch(uri)).blob();
  const contentType = contentTypeFor(uri, blob.type);
  const { uploadUrl, publicUrl } = await presign('image', fileName, contentType);

  await putToS3(uploadUrl, blob, contentType, onProgress);

  return { url: publicUrl, fileName, fileSize: blob.size, mimeType: contentType };
}

export async function uploadAvatar(uri: string, _apolloClient?: unknown): Promise<string> {
  const fileName = uri.split('/').pop() || 'avatar.jpg';
  const blob = await (await fetch(uri)).blob();
  const contentType = contentTypeFor(uri, blob.type);
  const { uploadUrl, publicUrl } = await presign('avatar', fileName, contentType);
  await putToS3(uploadUrl, blob, contentType);
  return publicUrl;
}
