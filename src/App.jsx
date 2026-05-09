import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import ParticleBackground from './components/ParticleBackground'
import PulseCore from './components/PulseCore'
import TopBar from './components/TopBar'
import MarketPulseView from './components/MarketPulseView'
import WalletTrackerView from './components/WalletTrackerView'
import { useMarketData } from './hooks/useMarketData'

function AppShell() {
  const { activeView, isPulsing, volatilityIndex } = useApp()
  const { tokens, smartMoney, loading } = useMarketData()

  return (
    <div className={`app-shell relative min-h-screen ${isPulsing ? 'data-pulse' : ''}`}>
      <ParticleBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
          <PulseCore />

          {/* Volatility Bar */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <span className="text-xs text-text-muted font-mono uppercase tracking-wider">Volatility</span>
            <div className="flex-1 h-1 bg-void-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${volatilityIndex * 100}%`,
                  background: volatilityIndex > 0.6
                    ? 'linear-gradient(90deg, #06B6D4, #F87171)'
                    : volatilityIndex > 0.3
                      ? 'linear-gradient(90deg, #06B6D4, #8B5CF6)'
                      : '#06B6D4',
                }}
              />
            </div>
            <span className="text-xs font-mono text-pulse-400">{(volatilityIndex * 100).toFixed(0)}%</span>
          </div>

          {/* Views */}
          <AnimatePresence mode="wait">
            {activeView === 'market' ? (
              <MarketPulseView key="market" tokens={tokens} loading={loading} />
            ) : (
              <WalletTrackerView key="wallet" smartMoney={smartMoney} />
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-void-3/30 py-4 px-8 text-center">
          <p className="text-xs text-text-muted font-mono">
            AlphaPulse v1.0 — Solana Smart Money Tracker — Frontier Hackathon
          </p>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
