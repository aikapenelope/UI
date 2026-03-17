'use client'

import { memo, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Plus, X, Trash2 } from 'lucide-react'
import type { FilterSchemaResponse } from '@/types/agentOS'
import type { FilterClause } from '@/stores/tracesStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFieldSchema(schema: FilterSchemaResponse, key: string) {
  return schema.fields.find((f) => f.key === key)
}

// ---------------------------------------------------------------------------
// Single filter clause row
// ---------------------------------------------------------------------------

interface ClauseRowProps {
  clause: FilterClause
  schema: FilterSchemaResponse
  onUpdate: (id: string, updates: Partial<FilterClause>) => void
  onRemove: (id: string) => void
}

function ClauseRow({ clause, schema, onUpdate, onRemove }: ClauseRowProps) {
  const field = getFieldSchema(schema, clause.key)
  const operators = field?.operators ?? ['EQ']
  const hasEnumValues = field?.values && field.values.length > 0

  return (
    <div className="flex items-center gap-1.5">
      {/* Field selector */}
      <select
        value={clause.key}
        onChange={(e) =>
          onUpdate(clause.id, {
            key: e.target.value,
            operator: 'EQ',
            value: ''
          })
        }
        className="h-7 rounded border border-border bg-background px-2 text-xs text-primary outline-none"
      >
        {schema.fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator selector */}
      <select
        value={clause.operator}
        onChange={(e) => onUpdate(clause.id, { operator: e.target.value })}
        className="h-7 rounded border border-border bg-background px-2 text-xs text-primary outline-none"
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>

      {/* Value input */}
      {hasEnumValues ? (
        <select
          value={clause.value}
          onChange={(e) => onUpdate(clause.id, { value: e.target.value })}
          className="h-7 min-w-[80px] rounded border border-border bg-background px-2 text-xs text-primary outline-none"
        >
          <option value="">any</option>
          {field!.values!.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ) : (
        <Input
          value={clause.value}
          onChange={(e) => onUpdate(clause.id, { value: e.target.value })}
          placeholder="value"
          className="h-7 w-[120px] text-xs"
        />
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(clause.id)}
        className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface TraceFilterBarProps {
  schema: FilterSchemaResponse | null
  clauses: FilterClause[]
  onAdd: (clause: FilterClause) => void
  onUpdate: (id: string, updates: Partial<FilterClause>) => void
  onRemove: (id: string) => void
  onClear: () => void
  onApply: () => void
  isLoading: boolean
}

function TraceFilterBarInner({
  schema,
  clauses,
  onAdd,
  onUpdate,
  onRemove,
  onClear,
  onApply,
  isLoading
}: TraceFilterBarProps) {
  const idPrefix = useId()

  if (!schema) return null

  const defaultField = schema.fields[0]?.key ?? 'status'

  function handleAdd() {
    onAdd({
      id: `${idPrefix}-${Date.now()}`,
      key: defaultField,
      operator: 'EQ',
      value: ''
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onApply()
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2"
      onKeyDown={handleKeyDown}
    >
      {clauses.map((clause) => (
        <ClauseRow
          key={clause.id}
          clause={clause}
          schema={schema}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}

      {/* Add filter button */}
      <button
        onClick={handleAdd}
        className="flex h-7 items-center gap-1 rounded border border-dashed border-border px-2 text-xs text-muted hover:border-primary/40 hover:text-primary"
      >
        <Plus size={12} />
        Filter
      </button>

      {/* Actions */}
      {clauses.length > 0 && (
        <>
          <button
            onClick={onApply}
            disabled={isLoading}
            className="h-7 rounded bg-primary px-3 text-xs font-medium text-primaryAccent hover:bg-primary/90 disabled:opacity-50"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted hover:text-primary"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </>
      )}
    </div>
  )
}

const TraceFilterBar = memo(TraceFilterBarInner)
TraceFilterBar.displayName = 'TraceFilterBar'

export default TraceFilterBar
