import React, { useRef, useCallback } from 'react'

export default function HoverCard({ children, className = '' }) {
  const ref = useRef(null)

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(8px)`
    el.style.boxShadow = `${-x * 10}px ${y * 10}px 30px rgba(6,182,212,0.15)`
    el.style.transition = 'none'
  }, [])

  const handleLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)'
    el.style.boxShadow = 'none'
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
  }, [])

  return (
    <div
      ref={ref}
      className={`glass-panel hover-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  )
}

