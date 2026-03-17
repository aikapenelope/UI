'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { UserMemory } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MemoryCreateEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If provided, dialog is in edit mode. Otherwise create mode. */
  memory: UserMemory | null
  isSaving: boolean
  onSave: (data: { memory: string; topics: string[] }) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MemoryCreateEditDialog({
  open,
  onOpenChange,
  memory,
  isSaving,
  onSave
}: MemoryCreateEditDialogProps) {
  const isEdit = memory !== null

  const [text, setText] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')

  // Reset form when dialog opens or memory changes
  useEffect(() => {
    if (open) {
      setText(memory?.memory ?? '')
      setTopics(memory?.topics ?? [])
      setTopicInput('')
    }
  }, [open, memory])

  // -----------------------------------------------------------------------
  // Topic management
  // -----------------------------------------------------------------------

  const addTopic = useCallback(() => {
    const trimmed = topicInput.trim().toLowerCase()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed])
    }
    setTopicInput('')
  }, [topicInput, topics])

  const removeTopic = useCallback((topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic))
  }, [])

  const handleTopicKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTopic()
      }
    },
    [addTopic]
  )

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSave({ memory: trimmed, topics })
  }, [text, topics, onSave])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            {isEdit ? 'Edit Memory' : 'Create Memory'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Memory text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter memory content..."
              rows={4}
              maxLength={5000}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <span className="text-right text-[10px] text-muted">
              {text.length}/5000
            </span>
          </div>

          {/* Topics */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Topics</label>
            <div className="flex items-center gap-2">
              <input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                placeholder="Add topic and press Enter"
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={addTopic}
                disabled={!topicInput.trim()}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
              >
                Add
              </button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {topics.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="gap-1 text-[10px]"
                  >
                    {t}
                    <button
                      onClick={() => removeTopic(t)}
                      className="ml-0.5 rounded-full hover:text-red-400"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
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
            disabled={!text.trim() || isSaving}
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
