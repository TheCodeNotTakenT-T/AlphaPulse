import React, { useEffect, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AnimatedNumber — Rule 4 (Typography is Motion)
 *
 * Odometer-style digit roller. Each digit slides out vertically when it changes.
 * Uses `font-variant-numeric: tabular-nums` to prevent layout shift.
 *
 * Props:
 *   value    — the numeric string to display (e.g. "$178.42")
 *   prefix   — optional prefix rendered statically (e.g. "$")
 *   className — forwarded to the wrapper span
 *   glitch   — if true, apply the price-glitch class on change (Rule 5)
 */
const SPRING = { type: 'spring', stiffness: 500, damping: 35, mass: 0.4 }

function Digit({ char, id }) {
  return (
    <span className="animated-number__slot" style={{ display: 'inline-block', position: 'relative' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${id}-${char}`}
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 18, opacity: 0 }}
          transition={SPRING}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function AnimatedNumber({ value, prefix = '', className = '', glitch = false }) {
  const str = String(value)
  const prevRef = useRef(str)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prevRef.current !== str) {
      prevRef.current = str
      if (glitch) {
        setFlash(true)
        const t = setTimeout(() => setFlash(false), 600)
        return () => clearTimeout(t)
      }
    }
  }, [str, glitch])

  return (
    <span
      className={`animated-number ${flash ? 'price-glitch' : ''} ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix && <span className="animated-number__prefix">{prefix}</span>}
      {str.split('').map((char, i) => (
        <Digit key={i} char={char} id={i} />
      ))}
    </span>
  )
}

export default memo(AnimatedNumber)
