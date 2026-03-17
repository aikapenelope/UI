'use client'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: React.ReactNode
}

export default function PagePlaceholder({
  title,
  description,
  icon
}: PagePlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground max-w-md text-sm">{description}</p>
      <div className="text-muted-foreground mt-2 rounded-lg border border-dashed border-primary/20 px-4 py-2 text-xs">
        Coming in Phase 2+
      </div>
    </div>
  )
}
