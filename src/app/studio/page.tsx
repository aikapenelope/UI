'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { Blocks } from 'lucide-react'

export default function StudioPage() {
  return (
    <PagePlaceholder
      title="Studio"
      description="Create and configure agents, teams, and workflows from the UI. Version configs with draft, publish, and rollback support."
      icon={<Blocks size={32} />}
    />
  )
}
