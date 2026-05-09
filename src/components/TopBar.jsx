import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, Activity, Eye } from 'lucide-react'
import { useApp } from '../context/AppContext'
import WalletModal from './WalletModal'

export default function TopBar() {
  const { activeView, setActiveView, walletConnected, walletAddress, disconnectWallet } = useApp()
  const [showWalletModal, setShowWalletModal] = useState(false)

  const tabs = [
    { id: 'market', label: 'Market Pulse', icon: Activity },
    { id: 'wallet', label: 'Wallet Tracker', icon: Eye },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 flex items-center justify-between px-4 md:px-8 py-3 border-b border-void-3/50"
        style={{ background: 'rgba(7,8,10,0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-500 to-signal-500 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-pulse-400 hidden sm:block">
            AlphaPulse
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-void-1/80 rounded-xl p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`tab-btn flex items-center gap-2 ${activeView === tab.id ? 'active' : ''}`}
              >
                {activeView === tab.id && (
                  <motion.div
                    layoutId="tab-glow"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Wallet Button */}
        {walletConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-void-2 border border-pulse-500/20">
              <div className="w-2 h-2 rounded-full bg-gain animate-pulse" />
              <span className="text-xs font-mono text-pulse-400">{walletAddress}</span>
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 rounded-lg hover:bg-void-2 transition-colors text-text-secondary hover:text-loss"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowWalletModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Wallet size={14} />
            <span className="hidden sm:inline">Connect</span>
          </button>
        )}
      </motion.header>

      <AnimatePresence>
        {showWalletModal && (
          <WalletModal onClose={() => setShowWalletModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
