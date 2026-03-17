'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { useMemoryStore } from '@/stores/memoryStore'
import {
  getMemoriesAPI,
  getMemoryTopicsAPI,
  getUserMemoryStatsAPI,
  createMemoryAPI,
  updateMemoryAPI,
  deleteMemoryAPI,
  deleteMemoriesAPI,
  optimizeMemoriesAPI
} from '@/api/memory'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, Sparkles, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import MemoryListTable from '@/components/memory/MemoryListTable'
import MemoryCreateEditDialog from '@/components/memory/MemoryCreateEditDialog'
import MemoryOptimizeDialog from '@/components/memory/MemoryOptimizeDialog'
import type { UserMemory } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MemoryPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    memories,
    topics,
    userStats,
    pagination,
    searchText,
    selectedTopic,
    sortBy,
    sortOrder,
    selectedIds,
    editingMemory,
    isCreateDialogOpen,
    optimizeResult,
    isOptimizeDialogOpen,
    isLoading,
    isLoadingTopics,
    isLoadingStats,
    isSaving,
    isOptimizing,
    setMemories,
    setTopics,
    setUserStats,
    setPagination,
    setSearchText,
    setSelectedTopic,
    toggleSelected,
    selectAll,
    clearSelection,
    setEditingMemory,
    setIsCreateDialogOpen,
    setOptimizeResult,
    setIsOptimizeDialogOpen,
    setIsLoading,
    setIsLoadingTopics,
    setIsLoadingStats,
    setIsSaving,
    setIsOptimizing,
    setError
  } = useMemoryStore()

  const pageRef = useRef(1)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // -----------------------------------------------------------------------
  // Fetch memories
  // -----------------------------------------------------------------------

  const fetchMemories = useCallback(
    async (page = 1) => {
      if (!endpoint) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await getMemoriesAPI(
          endpoint,
          {
            page,
            limit: 20,
            search_content: searchText || undefined,
            topics: selectedTopic ?? undefined,
            sort_by: sortBy,
            sort_order: sortOrder
          },
          authToken || undefined
        )
        if (res) {
          setMemories(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch memories'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [
      endpoint,
      authToken,
      searchText,
      selectedTopic,
      sortBy,
      sortOrder,
      setMemories,
      setPagination,
      setIsLoading,
      setError
    ]
  )

  // -----------------------------------------------------------------------
  // Fetch topics
  // -----------------------------------------------------------------------

  const fetchTopics = useCallback(async () => {
    if (!endpoint) return
    setIsLoadingTopics(true)
    try {
      const res = await getMemoryTopicsAPI(
        endpoint,
        undefined,
        authToken || undefined
      )
      if (res) setTopics(res)
    } catch {
      // Non-critical, silently fail
    } finally {
      setIsLoadingTopics(false)
    }
  }, [endpoint, authToken, setTopics, setIsLoadingTopics])

  // -----------------------------------------------------------------------
  // Fetch user stats
  // -----------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    if (!endpoint) return
    setIsLoadingStats(true)
    try {
      const res = await getUserMemoryStatsAPI(
        endpoint,
        { limit: 10 },
        authToken || undefined
      )
      if (res) setUserStats(res.data)
    } catch {
      // Non-critical
    } finally {
      setIsLoadingStats(false)
    }
  }, [endpoint, authToken, setUserStats, setIsLoadingStats])

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------

  useEffect(() => {
    fetchMemories(1)
    fetchTopics()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  // Re-fetch when topic filter changes
  useEffect(() => {
    fetchMemories(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, sortBy, sortOrder])

  // -----------------------------------------------------------------------
  // Debounced search
  // -----------------------------------------------------------------------

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        fetchMemories(1)
      }, 400)
    },
    [setSearchText, fetchMemories]
  )

  // -----------------------------------------------------------------------
  // CRUD handlers
  // -----------------------------------------------------------------------

  const handleSave = useCallback(
    async (data: { memory: string; topics: string[] }) => {
      if (!endpoint) return
      setIsSaving(true)
      try {
        if (editingMemory) {
          const res = await updateMemoryAPI(
            endpoint,
            editingMemory.memory_id,
            { memory: data.memory, topics: data.topics },
            undefined,
            authToken || undefined
          )
          if (res) {
            toast.success('Memory updated')
            setEditingMemory(null)
            setIsCreateDialogOpen(false)
            fetchMemories(pageRef.current)
          }
        } else {
          const res = await createMemoryAPI(
            endpoint,
            { memory: data.memory, topics: data.topics },
            undefined,
            authToken || undefined
          )
          if (res) {
            toast.success('Memory created')
            setIsCreateDialogOpen(false)
            fetchMemories(1)
            fetchTopics()
          }
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to save memory'
        )
      } finally {
        setIsSaving(false)
      }
    },
    [
      endpoint,
      authToken,
      editingMemory,
      fetchMemories,
      fetchTopics,
      setIsSaving,
      setEditingMemory,
      setIsCreateDialogOpen
    ]
  )

  const handleDelete = useCallback(
    async (memoryId: string) => {
      if (!endpoint) return
      const ok = await deleteMemoryAPI(
        endpoint,
        memoryId,
        undefined,
        authToken || undefined
      )
      if (ok) {
        toast.success('Memory deleted')
        fetchMemories(pageRef.current)
      }
    },
    [endpoint, authToken, fetchMemories]
  )

  const handleBulkDelete = useCallback(async () => {
    if (!endpoint || selectedIds.size === 0) return
    const ok = await deleteMemoriesAPI(
      endpoint,
      { memory_ids: Array.from(selectedIds) },
      undefined,
      authToken || undefined
    )
    if (ok) {
      toast.success(`Deleted ${selectedIds.size} memories`)
      clearSelection()
      fetchMemories(1)
      fetchTopics()
    }
  }, [
    endpoint,
    authToken,
    selectedIds,
    clearSelection,
    fetchMemories,
    fetchTopics
  ])

  const handleEdit = useCallback(
    (memory: UserMemory) => {
      setEditingMemory(memory)
      setIsCreateDialogOpen(true)
    },
    [setEditingMemory, setIsCreateDialogOpen]
  )

  // -----------------------------------------------------------------------
  // Optimize handlers
  // -----------------------------------------------------------------------

  const handleOptimizePreview = useCallback(
    async (userId: string) => {
      if (!endpoint) return
      setIsOptimizing(true)
      setOptimizeResult(null)
      try {
        const res = await optimizeMemoriesAPI(
          endpoint,
          { user_id: userId, apply: false },
          undefined,
          authToken || undefined
        )
        if (res) setOptimizeResult(res)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Optimization failed')
      } finally {
        setIsOptimizing(false)
      }
    },
    [endpoint, authToken, setIsOptimizing, setOptimizeResult]
  )

  const handleOptimizeApply = useCallback(
    async (userId: string) => {
      if (!endpoint) return
      setIsOptimizing(true)
      try {
        const res = await optimizeMemoriesAPI(
          endpoint,
          { user_id: userId, apply: true },
          undefined,
          authToken || undefined
        )
        if (res) {
          setOptimizeResult(res)
          toast.success('Memories optimized')
          fetchMemories(1)
          fetchTopics()
          fetchStats()
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Optimization failed')
      } finally {
        setIsOptimizing(false)
      }
    },
    [
      endpoint,
      authToken,
      setIsOptimizing,
      setOptimizeResult,
      fetchMemories,
      fetchTopics,
      fetchStats
    ]
  )

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-sm font-semibold text-primary">Memory</h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded border border-red-800 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-900/20"
            >
              <Trash2 size={12} />
              Delete {selectedIds.size}
            </button>
          )}
          <button
            onClick={() => {
              setOptimizeResult(null)
              setIsOptimizeDialogOpen(true)
            }}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1 text-xs text-muted transition-colors hover:bg-accent hover:text-primary"
          >
            <Sparkles size={12} />
            Optimize
          </button>
          <button
            onClick={() => {
              setEditingMemory(null)
              setIsCreateDialogOpen(true)
            }}
            className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90"
          >
            <Plus size={12} />
            Create
          </button>
        </div>
      </div>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: topics + user stats */}
        <div className="flex w-56 flex-col border-r border-border">
          {/* Topics */}
          <div className="border-b border-border p-3">
            <h3 className="mb-2 text-[10px] font-medium uppercase text-muted">
              Topics
            </h3>
            {isLoadingTopics ? (
              <div className="flex flex-col gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 rounded" />
                ))}
              </div>
            ) : topics.length === 0 ? (
              <p className="text-[10px] text-muted">No topics</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                    selectedTopic === null
                      ? 'bg-primary text-primaryAccent'
                      : 'text-muted hover:bg-accent hover:text-primary'
                  }`}
                >
                  All
                </button>
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTopic(selectedTopic === t ? null : t)
                    }
                  >
                    <Badge
                      variant={selectedTopic === t ? 'default' : 'secondary'}
                      className="cursor-pointer text-[10px]"
                    >
                      {t}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User stats */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase text-muted">
                <Users size={10} />
                User Stats
              </h3>
              {isLoadingStats ? (
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded" />
                  ))}
                </div>
              ) : userStats.length === 0 ? (
                <p className="text-[10px] text-muted">No stats</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {userStats.map((s) => (
                    <div
                      key={s.user_id}
                      className="flex items-center justify-between rounded border border-border px-2 py-1.5"
                    >
                      <span
                        className="truncate text-[10px] text-primary"
                        title={s.user_id}
                      >
                        {s.user_id.length > 14
                          ? s.user_id.slice(0, 14) + '...'
                          : s.user_id}
                      </span>
                      <span className="font-dmmono text-[10px] text-muted">
                        {s.total_memories}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Search size={13} className="text-muted" />
            <input
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search memories..."
              className="flex-1 bg-transparent text-xs text-primary placeholder:text-muted focus:outline-none"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <MemoryListTable
                memories={memories}
                pagination={pagination}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelected}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPageChange={(page) => fetchMemories(page)}
              />
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <MemoryCreateEditDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) setEditingMemory(null)
        }}
        memory={editingMemory}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <MemoryOptimizeDialog
        open={isOptimizeDialogOpen}
        onOpenChange={setIsOptimizeDialogOpen}
        isOptimizing={isOptimizing}
        result={optimizeResult}
        onPreview={handleOptimizePreview}
        onApply={handleOptimizeApply}
      />
    </div>
  )
}
