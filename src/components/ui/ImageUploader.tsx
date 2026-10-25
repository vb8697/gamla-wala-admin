'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, Plus, RefreshCw, UploadCloud, X } from 'lucide-react';

function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (JPG, PNG, WEBP)'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  max = 8,
  error,
  hint = 'JPG, PNG or WEBP · auto-optimised to 1200px',
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  max?: number;
  error?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState('');

  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) return setLocalError('Enter a full image URL starting with https://');
    setLocalError('');
    onChange([...images, u]);
    setUrl('');
    setUrlOpen(false);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setLocalError('');
    try {
      const out: string[] = [];
      for (const f of Array.from(files).slice(0, max - images.length)) out.push(await processImageFile(f));
      onChange([...images, ...out]);
    } catch (e: any) {
      setLocalError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const makeMain = (i: number) => {
    const next = [...images];
    const [m] = next.splice(i, 1);
    onChange([m, ...next]);
  };

  const msg = error || localError;

  return (
    <div>
      <input ref={inputRef} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {images.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? 'border-brand-500 bg-brand-50' : msg ? 'border-rose-300 bg-rose-50/40' : 'border-ink-300/70 bg-canvas/60 hover:border-brand-400 hover:bg-brand-50/40'
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
            {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          </div>
          <p className="text-[13px] font-semibold text-ink-800">
            Drop photos here or <span className="text-brand-700 underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">{hint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={i} className={`group relative aspect-square overflow-hidden rounded-xl border bg-canvas ${i === 0 ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-line'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => onChange(images.filter((_, x) => x !== i))} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove image">
                <X className="h-3 w-3" />
              </button>
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-brand-800 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>
              ) : (
                <button type="button" onClick={() => makeMain(i)} className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-ink-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Set cover
                </button>
              )}
            </div>
          ))}
          {images.length < max && (
            <button type="button" onClick={() => inputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-300/70 text-ink-500 transition-colors hover:border-brand-400 hover:text-brand-700">
              {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              <span className="text-[11px] font-semibold">Add</span>
            </button>
          )}
        </div>
      )}
      {images.length < max && (
        <div className="mt-3">
          {urlOpen ? (
            <div className="flex gap-2">
              <input className="input" placeholder="https://…/photo.jpg" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
              <button type="button" className="btn btn-secondary" onClick={addUrl}>Add</button>
            </div>
          ) : (
            <button type="button" className="text-xs font-semibold text-brand-700 hover:underline" onClick={() => setUrlOpen(true)}>Or add an image by URL</button>
          )}
        </div>
      )}
      {msg && (
        <p className="field-error flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {msg}
        </p>
      )}
    </div>
  );
}
