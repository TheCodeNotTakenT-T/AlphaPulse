import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

function AppStateProvider({ children }) {
  const wallet = useWallet()

  const [volatilityIndex, setVolatilityIndex] = useState(0.3)
  const [activeView, setActiveView] = useState('market')
  const [isPulsing, setIsPulsing] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const pulseTimeout = useRef(null)

  // Real wallet state from @solana/wallet-adapter
  const walletConnected = wallet.connected
  const walletAddress = wallet.publicKey?.toBase58() || null
  const walletPublicKey = wallet.publicKey?.toBase58() || null

  const connectWallet = useCallback(() => {
    wallet.select('Solflare')
    wallet.connect?.()
  }, [wallet])

  const disconnectWallet = useCallback(() => {
    wallet.disconnect?.()
  }, [wallet])

  const triggerPulse = useCallback(() => {
    setIsPulsing(true)
    if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
    pulseTimeout.current = setTimeout(() => setIsPulsing(false), 600)
  }, [])

  const pushAlert = useCallback((alert) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    setAlerts(prev => {
      // Max 5 alerts at a time
      const next = [...prev, { ...alert, id }]
      return next.slice(-5)
    })
  }, [])

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  // Modulate CSS animation speed based on volatility
  useEffect(() => {
    const root = document.documentElement
    const speed = 3 - volatilityIndex * 1.8
    root.style.setProperty('--anim-speed', `${Math.max(speed, 0.8)}s`)
  }, [volatilityIndex])

  const value = useMemo(() => ({
    volatilityIndex,
    setVolatilityIndex,
    walletConnected,
    walletAddress,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
    activeView,
    setActiveView,
    isPulsing,
    triggerPulse,
    alerts,
    pushAlert,
    dismissAlert,
    selectedToken,
    setSelectedToken,
    wallet, // Expose raw wallet for advanced usage
  }), [
    volatilityIndex, walletConnected, walletAddress, walletPublicKey,
    connectWallet, disconnectWallet, activeView, isPulsing, triggerPulse,
    alerts, pushAlert, dismissAlert, selectedToken, wallet,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function AppProvider({ children }) {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])
  const wallets = useMemo(() => [new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
