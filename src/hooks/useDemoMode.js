export function useDemoMode() {
  const p = new URLSearchParams(window.location.search)
  return p.has('demo') || p.has('demo2')
}
