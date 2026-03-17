'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { BookOpen } from 'lucide-react'

export default function KnowledgePage() {
  return (
    <PagePlaceholder
      title="Knowledge"
      description="Upload documents (PDF, TXT, MD, CSV), view indexed content with processing status, search the knowledge base, and manage remote sources."
      icon={<BookOpen size={32} />}
    />
  )
}
