'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { useKnowledgeStore, type KnowledgeTab } from '@/stores/knowledgeStore'
import {
  getContentAPI,
  deleteContentByIdAPI,
  uploadContentAPI,
  searchKnowledgeAPI
} from '@/api/knowledge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Database, Search } from 'lucide-react'
import { toast } from 'sonner'
import KnowledgeContentTable from '@/components/knowledge/KnowledgeContentTable'
import KnowledgeUploadDialog from '@/components/knowledge/KnowledgeUploadDialog'
import KnowledgeSearchPanel from '@/components/knowledge/KnowledgeSearchPanel'

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS: { value: KnowledgeTab; label: string; icon: React.ReactNode }[] = [
  { value: 'content', label: 'Content', icon: <Database size={12} /> },
  { value: 'search', label: 'Search', icon: <Search size={12} /> }
]

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function KnowledgePage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    activeTab,
    contents,
    contentPagination,
    searchQuery,
    searchResults,
    searchPagination,
    isUploadDialogOpen,
    isLoadingContent,
    isSearching,
    isUploading,
    setActiveTab,
    setContents,
    setContentPagination,
    setSearchQuery,
    setSearchResults,
    setSearchPagination,
    setIsUploadDialogOpen,
    setIsLoadingContent,
    setIsSearching,
    setIsUploading,
    setError
  } = useKnowledgeStore()

  const pageRef = useRef(1)

  // -----------------------------------------------------------------------
  // Fetch content list
  // -----------------------------------------------------------------------

  const fetchContent = useCallback(
    async (page = 1) => {
      if (!endpoint) return
      setIsLoadingContent(true)
      setError(null)
      try {
        const res = await getContentAPI(
          endpoint,
          { page, limit: 20, sort_by: 'created_at', sort_order: 'desc' },
          authToken || undefined
        )
        if (res) {
          setContents(res.data)
          setContentPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch content'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoadingContent(false)
      }
    },
    [
      endpoint,
      authToken,
      setContents,
      setContentPagination,
      setIsLoadingContent,
      setError
    ]
  )

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------

  useEffect(() => {
    fetchContent(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  // -----------------------------------------------------------------------
  // Delete content
  // -----------------------------------------------------------------------

  const handleDelete = useCallback(
    async (contentId: string) => {
      if (!endpoint) return
      const ok = await deleteContentByIdAPI(
        endpoint,
        contentId,
        authToken || undefined
      )
      if (ok) {
        toast.success('Content deleted')
        fetchContent(pageRef.current)
      }
    },
    [endpoint, authToken, fetchContent]
  )

  // -----------------------------------------------------------------------
  // Upload
  // -----------------------------------------------------------------------

  const handleUpload = useCallback(
    async (formData: FormData) => {
      if (!endpoint) return
      setIsUploading(true)
      try {
        const res = await uploadContentAPI(
          endpoint,
          formData,
          authToken || undefined
        )
        if (res) {
          toast.success('Content uploaded (processing)')
          setIsUploadDialogOpen(false)
          fetchContent(1)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [endpoint, authToken, fetchContent, setIsUploading, setIsUploadDialogOpen]
  )

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------

  const handleSearch = useCallback(async () => {
    if (!endpoint || !searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await searchKnowledgeAPI(
        endpoint,
        { query: searchQuery.trim() },
        authToken || undefined
      )
      if (res) {
        setSearchResults(res.data)
        setSearchPagination(res.meta)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [
    endpoint,
    authToken,
    searchQuery,
    setSearchResults,
    setSearchPagination,
    setIsSearching
  ])

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Knowledge</h1>
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === t.value
                    ? 'bg-primary text-primaryAccent'
                    : 'text-muted hover:bg-accent hover:text-primary'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab === 'content' && (
          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90"
          >
            <Plus size={12} />
            Upload
          </button>
        )}
      </div>

      {/* Content tab */}
      {activeTab === 'content' && (
        <>
          {isLoadingContent ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <KnowledgeContentTable
                contents={contents}
                pagination={contentPagination}
                onDelete={handleDelete}
                onPageChange={(page) => fetchContent(page)}
              />
            </ScrollArea>
          )}
        </>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <KnowledgeSearchPanel
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
          results={searchResults}
          pagination={searchPagination}
        />
      )}

      {/* Upload dialog */}
      <KnowledgeUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        isUploading={isUploading}
        onUpload={handleUpload}
      />
    </div>
  )
}
