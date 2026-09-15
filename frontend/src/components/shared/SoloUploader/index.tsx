"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

import { canUseFile, validateUploadSize, type UploadItem } from "./model";

type SoloUploaderProps = {
  maxBytes?: number;
  onChange?: (items: UploadItem[]) => void;
};

export function SoloUploader({
  maxBytes = 5 * 1024 * 1024,
  onChange,
}: SoloUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <input
        type="file"
        aria-label="Upload files"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const sizeCheck = validateUploadSize(file.size, maxBytes);
          if (!sizeCheck.ok) {
            setError(sizeCheck.reason ?? "invalid_file");
            return;
          }
          const item: UploadItem = {
            id: crypto.randomUUID(),
            fileName: file.name,
            sizeBytes: file.size,
            scanStatus: "scanning",
          };
          const next = [...items, item];
          setItems(next);
          onChange?.(next);
          setError(null);
          window.setTimeout(() => {
            setItems((current) =>
              current.map((entry) =>
                entry.id === item.id ? { ...entry, scanStatus: "safe" } : entry,
              ),
            );
          }, 300);
        }}
      />
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span>
              {item.fileName} · {item.scanStatus}
            </span>
            <Button size="sm" variant="secondary" disabled={!canUseFile(item)}>
              Use
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export * from "./model";
