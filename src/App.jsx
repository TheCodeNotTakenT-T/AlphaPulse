import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import ParticleBackground from './components/ParticleBackground'
import PulseCore from './components/PulseCore'
import TopBar from './components/TopBar'
import VolatilityBand from './components/VolatilityBand'
import MarketPulseView from './components/MarketPulseView'
import WalletTrackerView from './components/WalletTrackerView'
import SmartMoneyAlert from './components/SmartMoneyAlert'
import TokenDetailDrawer from './components/TokenDetailDrawer'
import { useMarketData } from './hooks/useMarketData'

function AppShell() {
  const {
    activeView, isPulsing, alerts, dismissAlert,
    selectedToken, setSelectedToken,
  } = useApp()
  const { tokens, trendingAddresses, loading, lastUpdate } = useMarketData()

  return (
    <div className={`app-shell relative min-h-screen ${isPulsing ? 'data-pulse' : ''}`}>
      <ParticleBackground />

      {/* Volatility Band — fixed at top */}
      <VolatilityBand />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
          <PulseCore />

          {/* Views */}
          <AnimatePresence mode="wait">
            {activeView === 'market' ? (
              <MarketPulseView key="market" tokens={tokens} loading={loading} />
            ) : (
              <WalletTrackerView key="wallet" />
            )}
          </AnimatePresence>
        </main>

        {/* Toast Alerts */}
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '380px' }}>
          <AnimatePresence>
            {alerts.map(alert => (
              <div key={alert.id} className="pointer-events-auto">
                <SmartMoneyAlert alert={alert} onDismiss={dismissAlert} />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Token Detail Drawer */}
        <AnimatePresence>
          {selectedToken && (
            <TokenDetailDrawer
              key="token-detail"
              token={selectedToken}
              onClose={() => setSelectedToken(null)}
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="relative z-10 border-t border-void-3/30 py-4 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs text-text-muted font-mono">
              AlphaPulse v1.0 — Solana Smart Money Tracker
            </p>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-xs text-text-muted font-mono hidden sm:block">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <span className="text-xs text-text-muted font-mono">
                Powered by <span className="text-pulse-400">Birdeye</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ErrorBoundary>
  )
}
