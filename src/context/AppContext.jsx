import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

export function AppProvider({ children }) {
  const [volatilityIndex, setVolatilityIndex] = useState(0.3)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [activeView, setActiveView] = useState('market')
  const [isPulsing, setIsPulsing] = useState(false)
  const pulseTimeout = useRef(null)

  const triggerPulse = useCallback(() => {
    setIsPulsing(true)
    if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
    pulseTimeout.current = setTimeout(() => setIsPulsing(false), 600)
  }, [])

  const connectWallet = useCallback(() => {
    const addr = '7xKX' + Math.random().toString(36).slice(2, 6).toUpperCase() +
      '...' + Math.random().toString(36).slice(2, 6).toUpperCase()
    setWalletAddress(addr)
    setWalletConnected(true)
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setWalletConnected(false)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const speed = 3 - volatilityIndex * 1.8
    root.style.setProperty('--anim-speed', `${Math.max(speed, 0.8)}s`)
  }, [volatilityIndex])

  const value = {
    volatilityIndex,
    setVolatilityIndex,
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    activeView,
    setActiveView,
    isPulsing,
    triggerPulse,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
