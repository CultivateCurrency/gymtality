"use client";

import { useState } from "react";

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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      return data.data;
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
