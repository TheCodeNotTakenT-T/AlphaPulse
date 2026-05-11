import React, { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const { volatilityIndex, walletConnected } = useApp()
  const particlesRef = useRef([])
  const novaRef = useRef(false)
  const volatilityRef = useRef(volatilityIndex)
  const prevConnected = useRef(false)

  volatilityRef.current = volatilityIndex

  useEffect(() => {
    if (walletConnected && !prevConnected.current) {
      novaRef.current = true
      setTimeout(() => { novaRef.current = false }, 1500)
    }
    prevConnected.current = walletConnected
  }, [walletConnected])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.min(200, Math.floor(window.innerWidth * window.innerHeight / 5000))
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    let raf
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const v = volatilityRef.current
      const speed = 1 + v * 2

      for (const p of particlesRef.current) {
        if (novaRef.current) {
          const dx = p.x - canvas.width / 2
          const dy = p.y - canvas.height / 2
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          p.vx += (dx / dist) * 1.5
          p.vy += (dy / dist) * 1.5
        }

        p.x += p.vx * speed
        p.y += p.vy * speed
        p.vx *= 0.995
        p.vy *= 0.995

        if (p.vx * p.vx + p.vy * p.vy < 0.01) {
          p.vx = (Math.random() - 0.5) * 0.3
          p.vy = (Math.random() - 0.5) * 0.3
        }

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        const a = p.alpha * (0.5 + v * 0.5)
        ctx.fillStyle = `rgba(6, 182, 212, ${a})`
        ctx.fill()
      }

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i]
          const b = particlesRef.current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = dx * dx + dy * dy
          if (dist < 8000) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.04 * (1 - dist / 8000)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-bg" />
}

