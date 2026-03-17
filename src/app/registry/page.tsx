'use client'

import PagePlaceholder from '@/components/layout/PagePlaceholder'
import { Package } from 'lucide-react'

export default function RegistryPage() {
  return (
    <PagePlaceholder
      title="Registry"
      description="Browse registered tools, models, databases, vector stores, schemas, and functions available in your AgentOS instance."
      icon={<Package size={32} />}
    />
  )
}
