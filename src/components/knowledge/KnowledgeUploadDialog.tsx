'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Upload, FileText, Link, Type } from 'lucide-react'

// ---------------------------------------------------------------------------
// Upload mode tabs
// ---------------------------------------------------------------------------

type UploadMode = 'file' | 'url' | 'text'

const MODES: { value: UploadMode; label: string; icon: React.ReactNode }[] = [
  { value: 'file', label: 'File', icon: <FileText size={12} /> },
  { value: 'url', label: 'URL', icon: <Link size={12} /> },
  { value: 'text', label: 'Text', icon: <Type size={12} /> }
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KnowledgeUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isUploading: boolean
  onUpload: (formData: FormData) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KnowledgeUploadDialog({
  open,
  onOpenChange,
  isUploading,
  onUpload
}: KnowledgeUploadDialogProps) {
  const [mode, setMode] = useState<UploadMode>('file')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setUrl('')
    setTextContent('')
    setFile(null)
  }, [])

  const handleSubmit = useCallback(() => {
    const fd = new FormData()
    if (name.trim()) fd.append('name', name.trim())
    if (description.trim()) fd.append('description', description.trim())

    if (mode === 'file' && file) {
      fd.append('file', file)
    } else if (mode === 'url' && url.trim()) {
      fd.append('url', url.trim())
    } else if (mode === 'text' && textContent.trim()) {
      fd.append('text_content', textContent.trim())
    } else {
      return // nothing to upload
    }

    onUpload(fd)
    resetForm()
  }, [mode, name, description, url, textContent, file, onUpload, resetForm])

  const canSubmit =
    !isUploading &&
    ((mode === 'file' && file !== null) ||
      (mode === 'url' && url.trim().length > 0) ||
      (mode === 'text' && textContent.trim().length > 0))

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm()
        onOpenChange(o)
      }}
    >
      <DialogContent className="border-border bg-[#111113] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Upload size={14} />
            Upload Content
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Mode tabs */}
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === m.value
                    ? 'bg-primary text-primaryAccent'
                    : 'text-muted hover:bg-accent hover:text-primary'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Description (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Mode-specific input */}
          {mode === 'file' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">File</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-xs text-muted transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <Upload size={16} />
                {file ? file.name : 'Click to select a file'}
              </button>
            </div>
          )}

          {mode === 'url' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}

          {mode === 'text' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste or type text content..."
                rows={6}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:bg-accent hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
