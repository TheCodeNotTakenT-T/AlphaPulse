import React from 'react'
import { motion } from 'framer-motion'
import { Eye, ArrowUpRight, ArrowDownRight, Clock, Wallet } from 'lucide-react'
import HoverCard from './HoverCard'
import { useApp } from '../context/AppContext'

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const listItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 },
  },
}

const MOCK_HOLDINGS = [
  { token: 'SOL', amount: '245.8', value: '$43,832', change: '+5.4%', positive: true },
  { token: 'JUP', amount: '12,400', value: '$15,376', change: '+3.2%', positive: true },
  { token: 'BONK', amount: '48,000,000', value: '$1,123', change: '+12.5%', positive: true },
  { token: 'RAY', amount: '1,200', value: '$7,044', change: '-2.1%', positive: false },
  { token: 'PYTH', amount: '8,500', value: '$3,570', change: '+1.9%', positive: true },
]

export default function WalletTrackerView({ smartMoney }) {
  const { walletConnected } = useApp()

  return (
    <motion.div
      key="wallet"
      initial={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
      className="space-y-6"
    >
      {/* Wallet Holdings */}
      {walletConnected ? (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3 border-b border-void-3/50 flex items-center gap-2">
            <Wallet size={16} className="text-pulse-400" />
            <h3 className="font-display font-semibold text-sm">Your Holdings</h3>
            <span className="ml-auto text-xs font-mono text-gain">$70,945 total</span>
          </div>

          <motion.div variants={listContainer} initial="hidden" animate="visible">
            {MOCK_HOLDINGS.map((h) => (
              <motion.div
                key={h.token}
                variants={listItem}
                className="flex items-center justify-between px-5 py-3 border-b border-void-3/20 hover:bg-void-2/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-void-2 border border-void-3 flex items-center justify-center text-xs font-bold text-signal-400">
                    {h.token.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{h.token}</div>
                    <div className="text-xs text-text-muted font-mono">{h.amount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{h.value}</div>
                  <div className={`text-xs font-mono ${h.positive ? 'text-gain' : 'text-loss'}`}>
                    {h.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <HoverCard className="p-8 text-center">
          <Wallet size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Connect your wallet to view holdings</p>
        </HoverCard>
      )}

      {/* Smart Money Activity */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-void-3/50 flex items-center gap-2">
          <Eye size={16} className="text-signal-400" />
          <h3 className="font-display font-semibold text-sm">Smart Money Activity</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            <span className="text-xs text-text-muted">Live</span>
          </div>
        </div>

        <motion.div variants={listContainer} initial="hidden" animate="visible">
          {smartMoney.map((tx, i) => (
            <motion.div
              key={i}
              variants={listItem}
              className="flex items-center gap-4 px-5 py-3 border-b border-void-3/20 hover:bg-void-2/30 transition-colors"
            >
              {/* Action Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                tx.action === 'Sold' ? 'bg-loss/10' : 'bg-gain/10'
              }`}>
                {tx.action === 'Sold' ? (
                  <ArrowDownRight size={14} className="text-loss" />
                ) : (
                  <ArrowUpRight size={14} className="text-gain" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{tx.label}</span>
                  <span className="text-xs font-mono text-text-muted">{tx.address}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium ${tx.action === 'Sold' ? 'text-loss' : 'text-gain'}`}>
                    {tx.action}
                  </span>
                  <span className="text-xs text-text-secondary">{tx.token}</span>
                  <span className="text-xs font-mono text-text-secondary">{tx.amount}</span>
                </div>
              </div>

              {/* Right Side */}
              <div className="text-right shrink-0">
                <div className={`text-xs font-mono font-medium ${
                  tx.pnl.startsWith('+') ? 'text-gain' : 'text-loss'
                }`}>
                  {tx.pnl}
                </div>
                <div className="flex items-center gap-1 mt-0.5 justify-end">
                  <Clock size={10} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{tx.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
