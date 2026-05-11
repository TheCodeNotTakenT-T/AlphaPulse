import React, { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useApp } from '../context/AppContext'

function OrbitRings({ volatilityIndex }) {
  const speed = 20 - volatilityIndex * 12
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.2))' }}
    >
      {[100, 140, 180].map((r, i) => (
        <circle
          key={i}
          cx="200"
          cy="200"
          r={r}
          fill="none"
          stroke={i === 1 ? '#8B5CF6' : '#22D1EE'}
          strokeWidth="0.6"
          strokeDasharray={`${4 + i * 3} ${8 + i * 4}`}
          opacity={0.35 - i * 0.05}
          style={{
            animation: `spin ${speed + i * 6}s linear infinite`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            transformOrigin: 'center',
          }}
        />
      ))}
      {/* Signal Lines */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 200 + Math.cos(rad) * 60
        const y1 = 200 + Math.sin(rad) * 60
        const x2 = 200 + Math.cos(rad) * (180 + volatilityIndex * 20)
        const y2 = 200 + Math.sin(rad) * (180 + volatilityIndex * 20)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#22D1EE"
            strokeWidth="0.3"
            opacity={0.15 + volatilityIndex * 0.15}
            strokeDasharray="2 6"
            style={{
              animation: `spin ${30 + i * 5}s linear infinite`,
              transformOrigin: 'center',
            }}
          />
        )
      })}
    </svg>
  )
}

export default function PulseCore() {
  const { volatilityIndex } = useApp()
  const containerRef = useRef(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 60, damping: 12, mass: 1.5 })
  const springY = useSpring(rawY, { stiffness: 60, damping: 12, mass: 1.5 })

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    rawX.set(-dy * 18)
    rawY.set(dx * 18)
  }, [rawX, rawY])

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center py-8 md:py-12"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            rotateX: springX,
            rotateY: springY,
            transformStyle: 'preserve-3d',
          }}
        >
          <OrbitRings volatilityIndex={volatilityIndex} />
          <div className="core-orb relative z-10" />
          {/* Inner glow ring */}
          <div
            className="absolute w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full z-[5]"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
              animation: `pulse-breathe ${3 - volatilityIndex}s ease-in-out infinite reverse`,
            }}
          />
        </motion.div>
      </div>

      {/* Title under the core */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-center mt-4 relative z-10"
      >
        <h1 className="font-display text-3xl md:text-5xl font-bold bg-gradient-to-r from-pulse-400 via-signal-400 to-pulse-500 bg-clip-text text-transparent">
          AlphaPulse
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-2 font-body tracking-wide">
          Smart Money Tracker for Solana
        </p>
      </motion.div>
    </motion.div>
  )
}

