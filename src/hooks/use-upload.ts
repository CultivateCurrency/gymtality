"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("gymtality-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

interface UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

interface UseUploadReturn {
  upload: (file: File, folder: string, category: string) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    folder: string,
    category: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("category", category);

      setProgress(30);

      const token = getToken();
      // Do NOT set Content-Type — let the browser set multipart/form-data with boundary
      const res = await fetch(`${API_URL}/api/storage/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      return data.data as UploadResult;
    } catch (err: any) {
      const msg = err.message || "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setError(null);
    setProgress(0);
  };

  return { upload, uploading, progress, error, reset };
}
