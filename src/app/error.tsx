'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E53935]/30 bg-[#E53935]/10">
        <AlertTriangle size={20} className="text-[#E53935]" />
      </div>
      <div className="text-center">
        <h2 className="text-sm font-semibold text-primary">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mt-1 max-w-md text-xs">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">
            Digest: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="text-muted-foreground flex items-center gap-1.5 rounded border border-border px-4 py-1.5 text-xs hover:bg-accent hover:text-primary"
      >
        <RefreshCw size={12} />
        Try again
      </button>
    </div>
  )
}
