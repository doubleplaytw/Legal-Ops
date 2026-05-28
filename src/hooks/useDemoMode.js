import { useMemo } from 'react'

export function useDemoMode() {
  return useMemo(() => {
    const p = new URLSearchParams(window.location.search)
    return p.has('demo') || p.has('demo2')
  }, [])
}
