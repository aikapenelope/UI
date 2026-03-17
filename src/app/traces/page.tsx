'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { Activity } from 'lucide-react'

export default function TracesPage() {
  return (
    <PagePlaceholder
      title="Traces"
      description="Hierarchical trace viewer with span trees (AGENT, LLM, TOOL), duration, tokens, errors, and advanced filtering."
      icon={<Activity size={32} />}
    />
  )
}
