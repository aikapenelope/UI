'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { Brain } from 'lucide-react'

export default function MemoryPage() {
  return (
    <PagePlaceholder
      title="Memory"
      description="View, create, edit, and delete user memories. Optimize with deduplication and compression. Browse by topics and user stats."
      icon={<Brain size={32} />}
    />
  )
}
