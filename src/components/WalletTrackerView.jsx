import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, ArrowUpRight, ArrowDownRight, Clock, Wallet, RefreshCw } from 'lucide-react'
import HoverCard from './HoverCard'
import AnimatedNumber from './AnimatedNumber'
import { useApp } from '../context/AppContext'
import WalletModal from './WalletModal'
import { useWalletPortfolio } from '../hooks/useWalletPortfolio'
import { useWhaleTracker } from '../hooks/useWhaleTracker'

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const listItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

function formatUSD(val) {
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
  if (val >= 1e3) return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (val >= 1) return `$${val.toFixed(2)}`
  return `$${val.toFixed(4)}`
}

export default function WalletTrackerView() {
  const { walletConnected, walletPublicKey } = useApp()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { holdings, totalValue, loading: portfolioLoading, refetch } = useWalletPortfolio(walletPublicKey)
  const { whaleActivity, loading: whaleLoading } = useWhaleTracker()

  return (
    <motion.div
      key="wallet"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
      className="space-y-6"
    >
      {/* Wallet Holdings */}
      {walletConnected && walletPublicKey ? (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3 border-b border-void-3/50 flex items-center gap-2">
            <Wallet size={16} className="text-pulse-400" />
            <h3 className="font-display font-semibold text-sm">Your Holdings</h3>
            <button
              onClick={refetch}
              className="ml-2 p-1 rounded hover:bg-void-2 transition-colors text-text-muted hover:text-pulse-400"
              title="Refresh portfolio"
            >
              <RefreshCw size={12} />
            </button>
            <span className="ml-auto text-xs font-mono text-gain">
              {totalValue > 0 ? <AnimatedNumber value={formatUSD(totalValue)} glitch={false} /> : '$0.00'}
            </span>
          </div>

          {portfolioLoading ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-pulse-400/30 border-t-pulse-400 rounded-full animate-spin" />
              <p className="text-xs text-text-muted font-mono">Scanning wallet via Birdeye...</p>
            </div>
          ) : holdings.length > 0 ? (
            <motion.div variants={listContainer} initial="hidden" animate="visible">
              {holdings.map((h) => (
                <motion.div
                  key={h.address || h.symbol}
                  variants={listItem}
                  className="flex items-center justify-between px-5 py-3 border-b border-void-3/20 hover:bg-void-2/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {h.logoURI ? (
                      <img src={h.logoURI} alt={h.symbol} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-void-2 border border-void-3 flex items-center justify-center text-xs font-bold text-signal-400">
                        {h.symbol?.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{h.symbol}</div>
                      <div className="text-xs text-text-muted font-mono">{h.amount}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{h.valueFormatted}</div>
                    {h.change24h !== 0 && (
                      <div className={`text-xs font-mono ${h.change24h >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-text-muted">No token holdings found</p>
            </div>
          )}
        </div>
      ) : (
        <HoverCard className="p-8 text-center">
          <Wallet size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm mb-3">Connect your wallet to track your portfolio</p>
          <p className="text-xs text-text-muted mb-4">Real-time holdings powered by Birdeye data intelligence</p>
          <button onClick={() => setShowWalletModal(true)} className="btn-primary text-sm px-6 py-2">
            Connect Wallet
          </button>
        </HoverCard>
      )}

      {/* Smart Money / Whale Activity */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-void-3/50 flex items-center gap-2">
          <Eye size={16} className="text-signal-400" />
          <h3 className="font-display font-semibold text-sm">Smart Money Activity</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            <span className="text-xs text-text-muted">Live • Birdeye</span>
          </div>
        </div>

        {whaleLoading ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-signal-400/30 border-t-signal-400 rounded-full animate-spin" />
            <p className="text-xs text-text-muted font-mono">Scanning for whale activity...</p>
          </div>
        ) : whaleActivity.length > 0 ? (
          <motion.div variants={listContainer} initial="hidden" animate="visible">
            {whaleActivity.map((tx, i) => (
              <motion.div
                key={tx._key || i}
                variants={listItem}
                className="flex items-center gap-4 px-5 py-3 border-b border-void-3/20 hover:bg-void-2/30 transition-colors"
              >
                {/* Action Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.action === 'Sold' ? 'bg-loss/10' : 'bg-gain/10'
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
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={10} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{tx.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-8 text-center">
            <Eye size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-muted font-mono">No whale activity detected yet</p>
            <p className="text-xs text-text-muted mt-1">Monitoring SOL, JUP, WIF, BONK, JTO, PYTH</p>
          </div>
        )}
      </div>

      {/* Data Attribution */}
      <div className="text-center">
        <p className="text-xs text-text-muted font-mono">
          Powered by <span className="text-pulse-400">Birdeye</span> on-chain intelligence
        </p>
      </div>
      {showWalletModal && (
        <WalletModal onClose={() => setShowWalletModal(false)} />
      )}
    </motion.div>
  )
}
