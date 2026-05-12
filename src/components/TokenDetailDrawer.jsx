import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, TrendingUp, TrendingDown, Users, BarChart3, Lock, Unlock, ExternalLink, Zap } from 'lucide-react'
import { useTokenDetail } from '../hooks/useTokenDetail'

/**
 * OHLCVChart — Pure SVG area chart for token price history.
 * No chart library dependency — keeps bundle light.
 */
function OHLCVChart({ data }) {
  const { path, areaPath, min, max, lastPrice, change } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', areaPath: '', min: 0, max: 0, lastPrice: 0, change: 0 }

    const prices = data.map(d => d.c || d.close || d.value || 0).filter(p => p > 0)
    if (prices.length === 0) return { path: '', areaPath: '', min: 0, max: 0, lastPrice: 0, change: 0 }

    if (prices.length === 1) {
      // Just a straight line if only 1 point
      return {
        path: `M 8,100 L 592,100`,
        areaPath: `M 8,100 L 592,100 L 592,200 L 8,200 Z`,
        min: prices[0],
        max: prices[0],
        lastPrice: prices[0],
        change: 0
      }
    }

    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1

    const w = 600
    const h = 200
    const padding = 8

    const points = prices.map((p, i) => {
      const x = padding + (i / (prices.length - 1)) * (w - padding * 2)
      const y = padding + (1 - (p - minP) / range) * (h - padding * 2)
      return `${x},${y}`
    })

    const linePath = `M ${points.join(' L ')}`
    const area = `${linePath} L ${w - padding},${h} L ${padding},${h} Z`

    return {
      path: linePath,
      areaPath: area,
      min: minP,
      max: maxP,
      lastPrice: prices[prices.length - 1],
      change: prices.length > 1 ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 : 0,
    }
  }, [data])

  const positive = change >= 0
  const color = positive ? '#34D399' : '#F87171'

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-text-muted text-xs font-mono">
        Chart data unavailable
      </div>
    )
  }

  if (!path) {
    return (
      <div className="flex items-center justify-center h-[200px] text-text-muted text-xs font-mono">
        Processing chart data...
      </div>
    )
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 600 200" className="w-full h-[200px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-gradient)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-2 right-2 text-xs font-mono">
        <span className={positive ? 'text-gain' : 'text-loss'}>
          {positive ? '+' : ''}{change.toFixed(2)}% (24h)
        </span>
      </div>
    </div>
  )
}

/**
 * SignalGauge — Radial gauge showing buy/sell pressure ratio.
 * Score 0 = full bearish (needle left), 0.5 = neutral (needle top), 1 = full bullish (needle right)
 */
function SignalGauge({ score }) {
  // Clamp score to 0-1 range
  const s = Math.max(0, Math.min(1, score))
  // Map score to angle: 0 → -180° (left), 0.5 → -90° (top), 1 → 0° (right)
  const angleDeg = -180 + s * 180
  const angleRad = (angleDeg * Math.PI) / 180
  // Needle endpoint (pivot is at center-bottom of the semicircle)
  const needleX = 50 + Math.cos(angleRad) * 30
  const needleY = 50 + Math.sin(angleRad) * 30

  const color = s > 0.6 ? '#34D399' : s > 0.4 ? '#22D1EE' : '#F87171'
  const label = s > 0.6 ? 'BULLISH' : s > 0.4 ? 'NEUTRAL' : 'BEARISH'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-14 overflow-hidden">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* Background arc */}
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--void-3)" strokeWidth="4" strokeLinecap="round" />
          {/* Filled arc — strokeDasharray controls how much of the 126-unit arc is filled */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${s * 126} 126`}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {/* Needle — pivots from (50,50) and points into the arc */}
          <line
            x1="50" y1="50"
            x2={needleX}
            y2={needleY}
            stroke={color} strokeWidth="2" strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
      </div>
      <span className="text-xs font-mono font-medium" style={{ color }}>{label}</span>
      <span className="text-xs text-text-muted">{(s * 100).toFixed(0)}% buy pressure</span>
    </div>
  )
}

/**
 * TrustBadge — Visual trust score indicator.
 */
function TrustBadge({ score }) {
  const color = score >= 80 ? '#34D399' : score >= 50 ? '#FBBF24' : '#F87171'
  const label = score >= 80 ? 'High Trust' : score >= 50 ? 'Moderate' : 'Caution'

  return (
    <div className="flex items-center gap-2">
      <Shield size={14} style={{ color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color }}>{label}</span>
          <span className="text-xs font-mono text-text-muted">{score}/100</span>
        </div>
        <div className="h-1.5 bg-void-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}

function shortenAddr(addr) {
  if (!addr || addr.length < 10) return addr || ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatVol(vol) {
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`
  return `$${vol.toFixed(0)}`
}

/**
 * TokenDetailDrawer — Slide-up panel showing full token intel.
 */
export default function TokenDetailDrawer({ token, onClose }) {
  const { data, loading } = useTokenDetail(token?.address)

  if (!token) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: 'blur(4px)' }} />

        {/* Drawer */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
          className="relative z-10 w-full max-w-3xl glass-panel rounded-t-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-void-3/50" style={{ background: 'rgba(7,8,10,0.95)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3">
              {token.logoURI ? (
                <img src={token.logoURI} alt={token.symbol} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-void-2 border border-void-3 flex items-center justify-center text-sm font-bold text-pulse-400">
                  {token.symbol?.slice(0, 2)}
                </div>
              )}
              <div>
                <h2 className="font-display font-bold text-lg">{token.symbol}</h2>
                <p className="text-xs text-text-muted">{token.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://jup.ag/swap/SOL-${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C7F284] to-[#00BEF0] text-void-0 font-bold text-xs hover:opacity-90 transition-opacity"
                title="Trade on Jupiter"
              >
                <Zap size={12} />
                Trade on Jupiter
              </a>
              <div className="w-px h-4 bg-void-3/50 mx-1" />
              <a
                href={`https://birdeye.so/token/${token.address}?chain=solana`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-void-2 transition-colors text-text-muted hover:text-pulse-400"
                title="View on Birdeye"
              >
                <ExternalLink size={16} />
              </a>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-void-2 transition-colors text-text-secondary">
                <X size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-pulse-400/30 border-t-pulse-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Price Chart */}
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 size={12} />
                  24h Price Action
                </h3>
                <div className="bg-void-1/50 rounded-xl p-3 border border-void-3/30">
                  <OHLCVChart data={data?.ohlcv || []} />
                </div>
              </div>

              {/* Signal Score + Trust Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-void-1/50 rounded-xl p-4 border border-void-3/30">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Signal Score</h3>
                  <SignalGauge score={data?.signalScore || 0.5} />
                </div>
                <div className="bg-void-1/50 rounded-xl p-4 border border-void-3/30">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Token Security</h3>
                  <TrustBadge score={data?.trustScore || 70} />
                  {data?.security && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        {data.security.hasMintAuthority ? <Unlock size={10} className="text-loss" /> : <Lock size={10} className="text-gain" />}
                        <span className="text-text-muted">Mint Authority: {data.security.hasMintAuthority ? 'Active' : 'Revoked'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {data.security.hasFreezeAuthority ? <Unlock size={10} className="text-loss" /> : <Lock size={10} className="text-gain" />}
                        <span className="text-text-muted">Freeze Authority: {data.security.hasFreezeAuthority ? 'Active' : 'None'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Traders */}
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={12} />
                  Top Traders (24h)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Top Buyers */}
                  <div className="bg-void-1/50 rounded-xl p-3 border border-void-3/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={12} className="text-gain" />
                      <span className="text-xs font-medium text-gain">Top Buyers</span>
                    </div>
                    {(data?.topBuyers || []).length > 0 ? (
                      <div className="space-y-1.5">
                        {data.topBuyers.map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-text-muted">{shortenAddr(t.address)}</span>
                            <span className="font-mono text-gain">{formatVol(t.volume)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted space-y-1">
                        <p>Individual trader data requires Birdeye Pro</p>
                        {data?.overview?.buy24h > 0 && (
                          <p className="font-mono text-gain">{data.overview.buy24h.toLocaleString()} buy txns (24h)</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Top Sellers */}
                  <div className="bg-void-1/50 rounded-xl p-3 border border-void-3/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={12} className="text-loss" />
                      <span className="text-xs font-medium text-loss">Top Sellers</span>
                    </div>
                    {(data?.topSellers || []).length > 0 ? (
                      <div className="space-y-1.5">
                        {data.topSellers.map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-text-muted">{shortenAddr(t.address)}</span>
                            <span className="font-mono text-loss">{formatVol(t.volume)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted space-y-1">
                        <p>Individual trader data requires Birdeye Pro</p>
                        {data?.overview?.sell24h > 0 && (
                          <p className="font-mono text-loss">{data.overview.sell24h.toLocaleString()} sell txns (24h)</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div className="text-center pt-2 border-t border-void-3/30">
                <p className="text-xs text-text-muted font-mono">
                  Powered by <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="text-pulse-400 hover:underline">Birdeye</a> Data Intelligence
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
