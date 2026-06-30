"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Star, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Image uploader. Uploaded/added image URLs are submitted as hidden inputs
 * named `name` so the server action can read them — `formData.getAll(name)` for
 * a gallery, or `formData.get(name)` for a single image.
 *
 * - `multiple` (default true): a gallery; the first image is the primary one.
 * - `multiple={false}`: a single image; a new upload/URL replaces the current.
 */
export function ImageUploader({
  name = "images",
  initial = [],
  multiple = true,
}: {
  name?: string;
  initial?: string[];
  multiple?: boolean;
}) {
  const [items, setItems] = React.useState<string[]>(initial);
  const [uploading, setUploading] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const list = multiple ? Array.from(files) : [files[0]];
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Upload failed");
          continue;
        }
        const url = data.url as string;
        setItems((prev) => (multiple ? [...prev, url] : [url]));
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    setItems((prev) => prev.filter((u) => u !== url));
  }

  function makePrimary(url: string) {
    setItems((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    setItems((prev) =>
      multiple ? (prev.includes(u) ? prev : [...prev, u]) : [u],
    );
    setUrlInput("");
  }

  return (
    <div>
      {/* hidden inputs for form submission */}
      {items.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {/* previews */}
      {items.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-secondary"
            >
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {multiple && i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-medium text-gold-foreground">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {multiple && i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(url)}
                    title="Set as primary"
                    className="rounded-full bg-white/90 p-1.5 text-foreground hover:bg-white"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  title="Remove"
                  className="rounded-full bg-white/90 p-1.5 text-destructive hover:bg-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* dropzone / file picker */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-foreground",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Upload className="size-6" />
        )}
        <span>
          {uploading
            ? "Uploading…"
            : multiple
              ? "Click to upload images"
              : items.length > 0
                ? "Click to replace image"
                : "Click to upload image"}
        </span>
        <span className="text-xs">JPG, PNG, WEBP, AVIF — up to 5MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* optional: add by URL (e.g. existing brand assets) */}
      <div className="mt-3 flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="…or paste an image URL (e.g. /images/product assets/serum.webp)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addUrl}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}
