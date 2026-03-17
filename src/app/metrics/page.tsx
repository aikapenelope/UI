'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { BarChart3 } from 'lucide-react'

export default function MetricsPage() {
  return (
    <PagePlaceholder
      title="Metrics"
      description="Dashboard with runs per day, tokens per day, costs by model, active sessions, and unique users."
      icon={<BarChart3 size={32} />}
    />
  )
}
