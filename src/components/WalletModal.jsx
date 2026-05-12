import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function WalletModal({ onClose }) {
  const { wallets, select, connect, connecting } = useWallet()

  const handleConnect = async (walletName) => {
    try {
      select(walletName)
      // Small delay to allow adapter to initialize after selection
      setTimeout(async () => {
        try {
          await connect()
        } catch (e) {
          console.warn('Wallet connect error:', e)
        }
        onClose()
      }, 100)
    } catch (e) {
      console.warn('Wallet selection error:', e)
    }
  }

  // Show detected wallets, fallback to hardcoded list if none detected
  const walletList = wallets.length > 0
    ? wallets.filter(w => w.readyState === 'Installed' || w.readyState === 'Loadable').slice(0, 5)
    : []

  const FALLBACK_WALLETS = [
    { name: 'Phantom', color: '#AB9FF2', url: 'https://phantom.app' },
    { name: 'Solflare', color: '#FC822B', url: 'https://solflare.com' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: 'blur(8px)' }} />

      {/* Modal */}
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
          {walletList.length > 0 ? (
            walletList.map((wallet, i) => (
              <motion.button
                key={wallet.adapter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => handleConnect(wallet.adapter.name)}
                disabled={connecting}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-void-2/50 border border-void-3 hover:border-pulse-500/30 transition-all hover:bg-void-2 group disabled:opacity-50"
              >
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="w-10 h-10 rounded-xl"
                />
                <span className="font-medium text-text-primary group-hover:text-pulse-400 transition-colors">
                  {wallet.adapter.name}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {wallet.readyState === 'Installed' && (
                    <span className="text-xs text-gain font-mono">Detected</span>
                  )}
                  <div className="w-2 h-2 rounded-full bg-void-3 group-hover:bg-pulse-400 transition-colors" />
                </div>
              </motion.button>
            ))
          ) : (
            // Fallback: Show Solflare with install link
            FALLBACK_WALLETS.map((wallet, i) => (
              <motion.a
                key={wallet.name}
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-void-2/50 border border-void-3 hover:border-pulse-500/30 transition-all hover:bg-void-2 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: wallet.color }}
                >
                  {wallet.name[0]}
                </div>
                <div>
                  <span className="font-medium text-text-primary group-hover:text-pulse-400 transition-colors block">
                    Install {wallet.name}
                  </span>
                  <span className="text-xs text-text-muted">Recommended wallet for Solana</span>
                </div>
              </motion.a>
            ))
          )}
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">
          {connecting ? 'Connecting...' : 'Securely connect your Solana wallet'}
        </p>
      </motion.div>
    </motion.div>
  )
}
