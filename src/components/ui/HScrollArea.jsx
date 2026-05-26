import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'

function ArrowBtn({ onClick, dir }) {
  const right = dir === 'right' ? 'right-4' : 'right-16'
  return (
    <button
      onClick={onClick}
      className={`fixed ${right} top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-[#1E3480] hover:bg-[#1E3480] hover:text-white transition-all`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'left'
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  )
}

export default function HScrollArea({ children, className = '', style }) {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const check = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useLayoutEffect(() => { check() }, [children, check])

  useEffect(() => {
    const el = ref.current
    el?.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el?.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [check])

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={ref}
        className={`h-full overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] ${className}`}
        style={style}
      >
        {children}
      </div>
      {canLeft  && <ArrowBtn onClick={() => scroll(-1)} dir="left"  />}
      {canRight && <ArrowBtn onClick={() => scroll( 1)} dir="right" />}
    </div>
  )
}
