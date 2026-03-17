'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { FlaskConical } from 'lucide-react'

export default function EvalsPage() {
  return (
    <PagePlaceholder
      title="Evaluations"
      description="Run Accuracy, Performance, Reliability, and Agent-as-Judge evaluations. View results with metrics and compare across runs."
      icon={<FlaskConical size={32} />}
    />
  )
}
