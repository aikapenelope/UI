'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Save, User } from 'lucide-react'

const PROFILE_KEY = 'nexus-profile'

interface ProfileData {
  displayName: string
  email: string
  timezone: string
}

function loadProfile(): ProfileData {
  if (typeof window === 'undefined') {
    return { displayName: '', email: '', timezone: '' }
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw) as ProfileData
  } catch {
    /* ignore */
  }
  return {
    displayName: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

function saveProfile(data: ProfileData) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
}

export default function ProfilePage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [profile, setProfile] = useState<ProfileData>(loadProfile)
  const [dirty, setDirty] = useState(false)

  // Re-hydrate on mount (SSR safety)
  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  const update = useCallback((field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }, [])

  const handleSave = () => {
    saveProfile(profile)
    setDirty(false)
    toast.success('Profile saved')
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-accent">
            <User size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">Profile</h1>
            <p className="text-muted-foreground text-xs">
              Local user settings (stored in browser)
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Form */}
        <div className="flex flex-col gap-4">
          <Field
            label="Display Name"
            value={profile.displayName}
            onChange={(v) => update('displayName', v)}
            placeholder="Your name"
          />
          <Field
            label="Email"
            value={profile.email}
            onChange={(v) => update('email', v)}
            placeholder="you@example.com"
            type="email"
          />
          <Field
            label="Timezone"
            value={profile.timezone}
            onChange={(v) => update('timezone', v)}
            placeholder="America/New_York"
          />

          <Separator />

          {/* Connection info (read-only) */}
          <div>
            <h2 className="mb-2 text-xs font-semibold text-primary">
              Connection
            </h2>
            <div className="flex flex-col gap-2">
              <ReadOnlyField label="Endpoint" value={endpoint} />
              <ReadOnlyField
                label="Auth Token"
                value={authToken ? '********' : 'Not set'}
              />
            </div>
            <p className="text-muted-foreground mt-1 text-[10px]">
              Change connection settings from the sidebar settings icon.
            </p>
          </div>

          <Separator />

          {/* Browser info */}
          <div>
            <h2 className="mb-2 text-xs font-semibold text-primary">
              Environment
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] font-normal">
                Self-hosted
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                localStorage
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal">
                No cloud account required
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90 disabled:opacity-40"
          >
            <Save size={12} />
            Save Profile
          </button>
        </div>
      </div>
    </ScrollArea>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-[11px] font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-border px-3 py-1.5">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className="font-mono text-[11px] text-primary">{value}</span>
    </div>
  )
}
