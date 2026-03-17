import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent">
        <FileQuestion size={20} className="text-muted-foreground" />
      </div>
      <div className="text-center">
        <h2 className="text-sm font-semibold text-primary">Page not found</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          The page you are looking for does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="text-muted-foreground rounded border border-border px-4 py-1.5 text-xs hover:bg-accent hover:text-primary"
      >
        Back to Chat
      </Link>
    </div>
  )
}
