'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { Clock } from 'lucide-react'

export default function SchedulesPage() {
  return (
    <PagePlaceholder
      title="Schedules"
      description="Manage cron jobs for agents, teams, and workflows. Create, edit, enable/disable, trigger manually, and view execution history."
      icon={<Clock size={32} />}
    />
  )
}
