import React from 'react'
import { motion } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'

const WALLETS = [
  { name: 'Solflare', color: '#FC822B' },
  { name: 'Phantom', color: '#AB9FF2' },
  { name: 'Backpack', color: '#E33E3F' },
]

export default function WalletModal({ onClose }) {
  const { connectWallet } = useApp()

  const handleConnect = (walletName) => {
    connectWallet()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer / Modal */}
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
        className="glass-panel relative z-10 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-pulse-400" />
            <h2 className="font-display font-semibold text-lg">Connect Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-void-2 transition-colors text-text-secondary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {WALLETS.map((wallet, i) => (
            <motion.button
              key={wallet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => handleConnect(wallet.name)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-void-2/50 border border-void-3 hover:border-pulse-500/30 transition-all hover:bg-void-2 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: wallet.color }}
              >
                {wallet.name[0]}
              </div>
              <span className="font-medium text-text-primary group-hover:text-pulse-400 transition-colors">
                {wallet.name}
              </span>
              <div className="ml-auto w-2 h-2 rounded-full bg-void-3 group-hover:bg-pulse-400 transition-colors" />
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">
          Simulated connection. Switch to the Web3 agent for real wallet integration.
        </p>
      </motion.div>
    </motion.div>
  )
}
