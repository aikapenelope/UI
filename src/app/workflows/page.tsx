'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { GitBranch } from 'lucide-react'

export default function WorkflowsPage() {
  return (
    <PagePlaceholder
      title="Workflows"
      description="List available workflows, execute with input parameters, monitor execution state, and cancel active runs."
      icon={<GitBranch size={32} />}
    />
  )
}
