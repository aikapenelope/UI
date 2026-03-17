'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Catches unhandled errors in the React tree and renders a recovery UI
 * instead of crashing the entire application.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E53935]/30 bg-[#E53935]/10">
            <AlertTriangle size={20} className="text-[#E53935]" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-semibold text-primary">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mt-1 max-w-md text-xs">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="text-muted-foreground flex items-center gap-1.5 rounded border border-border px-4 py-1.5 text-xs hover:bg-accent hover:text-primary"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
