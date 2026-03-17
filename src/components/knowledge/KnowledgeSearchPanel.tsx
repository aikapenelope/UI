'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import type { VectorSearchResult, PaginationInfo } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

// ---------------------------------------------------------------------------
// Search result card
// ---------------------------------------------------------------------------

interface ResultCardProps {
  result: VectorSearchResult
}

function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary">
          {result.name || result.id}
        </span>
        <div className="flex items-center gap-2">
          {result.reranking_score != null && (
            <Badge variant="secondary" className="text-[10px]">
              Score: {result.reranking_score.toFixed(3)}
            </Badge>
          )}
          {result.content_id && (
            <span className="font-dmmono text-[10px] text-muted">
              {result.content_id.slice(0, 8)}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        {truncate(result.content, 300)}
      </p>
      {result.content_origin && (
        <span className="text-[10px] text-muted">
          Source: {result.content_origin}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface KnowledgeSearchPanelProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  isSearching: boolean
  results: VectorSearchResult[]
  pagination: PaginationInfo | null
}

function KnowledgeSearchPanelInner({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  results,
  pagination
}: KnowledgeSearchPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Search size={14} className="text-muted" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search knowledge base..."
          className="flex-1 bg-transparent text-xs text-primary placeholder:text-muted focus:outline-none"
        />
        <button
          onClick={onSearch}
          disabled={!query.trim() || isSearching}
          className="rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-4">
          {results.length === 0 && !isSearching && (
            <div className="flex h-32 items-center justify-center text-xs text-muted">
              Enter a query to search the knowledge base
            </div>
          )}
          {results.map((r, i) => (
            <ResultCard key={`${r.id}-${i}`} result={r} />
          ))}
          {pagination && pagination.total_count > 0 && (
            <p className="text-center text-[10px] text-muted">
              Showing {results.length} of {pagination.total_count} results
              {pagination.search_time_ms != null &&
                ` in ${pagination.search_time_ms.toFixed(0)}ms`}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

const KnowledgeSearchPanel = memo(KnowledgeSearchPanelInner)
KnowledgeSearchPanel.displayName = 'KnowledgeSearchPanel'

export default KnowledgeSearchPanel
