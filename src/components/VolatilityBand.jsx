import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

/**
 * VolatilityBand — Rule 5 (State Changes Announce Themselves)
 *                  Rule 8 (Color is Semantic)
 *
 * A fixed 3px-tall band at the very top of the viewport.
 * Color shifts semantically with the global volatilityIndex:
 *   0.0–0.3 → Cyan (system nominal)
 *   0.3–0.6 → Violet (elevated)
 *   0.6–1.0 → Amber/Crimson (warning/alert)
 *
 * Always visible, providing peripheral-vision state awareness.
 */
export default function VolatilityBand() {
  const { volatilityIndex } = useApp()

  const gradient = useMemo(() => {
    if (volatilityIndex > 0.6) {
      // High — amber to crimson (WARNING)
      return 'linear-gradient(90deg, #FF8C00, #FF2D55)'
    }
    if (volatilityIndex > 0.3) {
      // Medium — cyan to violet (ELEVATED)
      return 'linear-gradient(90deg, var(--pulse-400), var(--signal-500))'
    }
    // Low — pure cyan (NOMINAL)
    return 'linear-gradient(90deg, var(--pulse-500), var(--pulse-400))'
  }, [volatilityIndex])

  const glowColor = useMemo(() => {
    if (volatilityIndex > 0.6) return 'rgba(255, 140, 0, 0.5)'
    if (volatilityIndex > 0.3) return 'var(--signal-glow)'
    return 'var(--pulse-glow)'
  }, [volatilityIndex])

  return (
    <motion.div
      className="volatility-band"
      style={{ background: gradient, boxShadow: `0 1px 12px ${glowColor}` }}
      animate={{ scaleX: 0.3 + volatilityIndex * 0.7 }}
      transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}
