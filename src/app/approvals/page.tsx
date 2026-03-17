'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { ShieldCheck } from 'lucide-react'

export default function ApprovalsPage() {
  return (
    <PagePlaceholder
      title="Approvals"
      description="Human-in-the-loop approval queue. Review pending approvals, approve or reject agent actions, and track resolution history."
      icon={<ShieldCheck size={32} />}
    />
  )
}
