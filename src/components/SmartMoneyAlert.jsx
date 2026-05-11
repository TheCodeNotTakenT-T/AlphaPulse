import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react'

/**
 * SmartMoneyAlert — Rule 5 (State Changes Announce Themselves)
 *                   Rule 11 (Direction: enters from TOP-RIGHT — network signal)
 *
 * A toast notification that slides in from the top-right corner whenever a
 * significant smart-money event occurs. Auto-dismisses after 5 s.
 */
const SPRING = { type: 'spring', stiffness: 350, damping: 26, mass: 0.7 }

export default function SmartMoneyAlert({ alert, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(alert.id), 5000)
    return () => clearTimeout(t)
  }, [alert.id, onDismiss])

  const isSell = alert.action === 'Sold'

  return (
    <motion.div
      layout
      initial={{ x: 360, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 360, opacity: 0, scale: 0.85 }}
      transition={SPRING}
      className="smart-money-alert glass-panel"
    >
      {/* Accent bar */}
      <div
        className="smart-money-alert__accent"
        style={{ background: isSell ? 'var(--loss)' : 'var(--gain)' }}
      />

      <div className="smart-money-alert__body">
        {/* Icon */}
        <div
          className="smart-money-alert__icon"
          style={{
            background: isSell ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
          }}
        >
          {isSell ? (
            <ArrowDownRight size={14} style={{ color: 'var(--loss)' }} />
          ) : (
            <ArrowUpRight size={14} style={{ color: 'var(--gain)' }} />
          )}
        </div>

        {/* Content */}
        <div className="smart-money-alert__content">
          <div className="smart-money-alert__title">
            <span>{alert.label}</span>
            <span className="smart-money-alert__action" style={{
              color: isSell ? 'var(--loss)' : 'var(--gain)',
            }}>
              {alert.action} {alert.token}
            </span>
          </div>
          <div className="smart-money-alert__meta">
            {alert.amount}
          </div>
        </div>

        {/* Dismiss */}
        <button onClick={() => onDismiss(alert.id)} className="smart-money-alert__close">
          <X size={12} />
        </button>
      </div>
    </motion.div>
  )
}
