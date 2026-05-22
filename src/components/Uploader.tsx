import { useRef, useState, type KeyboardEvent } from 'react';
import type { Resource } from '../types';
import { uploadPdfToStorage } from '../lib/db';

// ── Chip tag input ─────────────────────────────────────────────────────────

interface ChipInputProps {
  chips: string[];
  onChange: (chips: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

function ChipInput({ chips, onChange, suggestions = [], placeholder = 'Add a tag…', autoFocus }: ChipInputProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t || chips.includes(t)) { setValue(''); return; }
    onChange([...chips, t]);
    setValue('');
    setOpen(false);
  };

  const removeLast = () => onChange(chips.slice(0, -1));
  const removeAt = (i: number) => onChange(chips.filter((_, idx) => idx !== i));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); if (value.trim()) add(value); }
    if (e.key === 'Backspace' && !value && chips.length) removeLast();
    if (e.key === 'Escape') { setOpen(false); setValue(''); }
  };

  const filtered = value.length > 0
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && !chips.includes(s)).slice(0, 6)
    : [];

  return (
    <div className="chip-input-wrap" onClick={() => inputRef.current?.focus()}>
      {chips.map((chip, i) => (
        <span key={i} className="chip-input-chip">
          {chip}
          <button
            type="button"
            className="chip-input-remove"
            onClick={(e) => { e.stopPropagation(); removeAt(i); }}
          >×</button>
        </span>
      ))}
      <div className="chip-input-inner">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          onKeyDown={handleKey}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onFocus={() => value.length > 0 && setOpen(true)}
          placeholder={chips.length === 0 ? placeholder : ''}
        />
        {open && filtered.length > 0 && (
          <div className="chip-suggestions">
            {filtered.map((s) => (
              <button key={s} type="button" onMouseDown={() => add(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Uploader ────────────────────────────────────────────────────────────────

type Mode = 'idle' | 'uploading' | 'pdf-tag' | 'link-form';

interface Props {
  userId: string;
  subjects: string[];
  onAdd: (r: Omit<Resource, 'id' | 'addedAt'>) => void;
}

export function Uploader({ userId, subjects, onAdd }: Props) {
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [pdfPending, setPdfPending] = useState<{ name: string; url: string } | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('idle');
    setPdfPending(null);
    setLinkUrl('');
    setLinkTitle('');
    setTags([]);
    setUploadError('');
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB limit.');
      return;
    }
    setMode('uploading');
    setUploadError('');
    setTags([]);
    const url = await uploadPdfToStorage(userId, file);
    if (!url) {
      setUploadError('Upload failed — check your connection and try again.');
      setMode('idle');
      return;
    }
    setPdfPending({ name: file.name, url });
    setMode('pdf-tag');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const submitPdf = () => {
    if (!pdfPending) return;
    onAdd({ type: 'pdf', name: pdfPending.name, url: pdfPending.url, tags });
    reset();
  };

  const submitLink = () => {
    const u = linkUrl.trim();
    if (!u) return;
    const safe = /^https?:\/\//i.test(u) ? u : 'https://' + u;
    let title = linkTitle.trim();
    if (!title) {
      try {
        const p = new URL(safe);
        title = p.hostname.replace(/^www\./, '') + (p.pathname === '/' ? '' : p.pathname.replace(/\/$/, ''));
      } catch { title = safe; }
    }
    onAdd({ type: 'link', name: title, url: safe, tags });
    reset();
  };

  const isActive = mode !== 'idle' && mode !== 'uploading';

  return (
    <div>
      <div
        className={`uploader${drag ? ' dragover' : ''}${isActive ? ' uploader-open' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (mode === 'idle') setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={(e) => {
          if (mode !== 'idle') return;
          if ((e.target as HTMLElement).closest('button, input')) return;
          fileRef.current?.click();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />

        {mode === 'idle' && (
          <>
            <div className="u-title">Drop a PDF, or add a link</div>
            <div className="u-sub">Tag resources by subject for easy filtering</div>
            <div className="uploader-row" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="u-btn ghost" onClick={() => fileRef.current?.click()}>
                Upload PDF
              </button>
              <button type="button" className="u-btn" onClick={() => { setMode('link-form'); setTags([]); }}>
                Add Link
              </button>
            </div>
          </>
        )}

        {mode === 'uploading' && (
          <div className="u-uploading">
            <span className="u-spinner" /> Uploading…
          </div>
        )}

        {mode === 'pdf-tag' && pdfPending && (
          <div className="u-form" onClick={(e) => e.stopPropagation()}>
            <div className="u-form-label">
              Tag <span className="u-form-name">{pdfPending.name}</span>
            </div>
            <ChipInput
              chips={tags}
              onChange={setTags}
              suggestions={subjects}
              placeholder="Type a tag, hit Enter…"
              autoFocus
            />
            <div className="u-form-actions">
              <button type="button" className="u-btn ghost" onClick={reset}>Cancel</button>
              <button type="button" className="u-btn" onClick={submitPdf}>Save</button>
            </div>
          </div>
        )}

        {mode === 'link-form' && (
          <div className="u-form" onClick={(e) => e.stopPropagation()}>
            <div className="u-form-fields">
              <input
                autoFocus
                className="u-field-input"
                placeholder="URL — https://…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitLink(); }}
              />
              <input
                className="u-field-input"
                placeholder="Title (optional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitLink(); }}
              />
            </div>
            <ChipInput
              chips={tags}
              onChange={setTags}
              suggestions={subjects}
              placeholder="Add tags…"
            />
            <div className="u-form-actions">
              <button type="button" className="u-btn ghost" onClick={reset}>Cancel</button>
              <button type="button" className="u-btn" disabled={!linkUrl.trim()} onClick={submitLink}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadError && <div className="u-error">{uploadError}</div>}
    </div>
  );
}
