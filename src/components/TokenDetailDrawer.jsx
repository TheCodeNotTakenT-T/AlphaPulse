import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, TrendingUp, TrendingDown, Users, BarChart3, Lock, Unlock, ExternalLink } from 'lucide-react'
import { useTokenDetail } from '../hooks/useTokenDetail'

function fmtLarge(n) {
  if (!n || n === 0) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(2)}`
}

function OHLCVChart({ data }) {
  const { path, areaPath, change, minP, maxP } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', areaPath: '', change: 0, minP: 0, maxP: 0 }
    const prices = data.map(d => d.c || d.close || d.value || 0).filter(p => p > 0)
    if (prices.length < 2) return { path: '', areaPath: '', change: 0, minP: 0, maxP: 0 }
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1
    const w = 600, h = 200, pad = 8
    const pts = prices.map((p, i) => {
      const x = pad + (i / (prices.length - 1)) * (w - pad * 2)
      const y = pad + (1 - (p - minP) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    const linePath = `M ${pts.join(' L ')}`
    return {
      path: linePath,
      areaPath: `${linePath} L ${w - pad},${h} L ${pad},${h} Z`,
      change: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
      minP,
      maxP,
    }
  }, [data])

  const positive = change >= 0
  const color = positive ? '#34D399' : '#F87171'

  function fmtPrice(p) {
    if (!p) return '0'
    if (p < 0.0001) return p.toExponential(2)
    if (p < 0.001) return p.toFixed(6)
    if (p < 1) return p.toFixed(4)
    if (p < 1000) return p.toFixed(2)
    return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  if (!path) {
    return (
      <div className="flex items-center justify-center h-[200px] text-text-muted text-xs font-mono">
        {!data || data.length === 0 ? 'Chart data unavailable' : 'Processing chart data...'}
      </div>
    )
  }

  return (
    <div className="relative flex gap-2">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between py-1 flex-shrink-0">
        {[maxP, (maxP + minP) / 2, minP].map((p, i) => (
          <span key={i} className="text-[9px] font-mono text-text-muted leading-none">
            ${fmtPrice(p)}
          </span>
        ))}
      </div>
      {/* Chart */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 600 200" className="w-full h-[200px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((t, i) => (
            <line key={i} x1="8" y1={8 + t * 184} x2="592" y2={8 + t * 184}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <path d={areaPath} fill="url(#chart-gradient)" />
          <path d={path} fill="none" stroke={color} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
        </svg>
        <div className="absolute top-1 right-1">
          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${positive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>
            {positive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

function SignalGauge({ score }) {
  const s = Math.max(0, Math.min(1, score))
  const angleDeg = -180 + s * 180
  const angleRad = (angleDeg * Math.PI) / 180
  const needleX = 50 + Math.cos(angleRad) * 30
  const needleY = 50 + Math.sin(angleRad) * 30
  const color = s > 0.6 ? '#34D399' : s > 0.4 ? '#22D1EE' : '#F87171'
  const label = s > 0.6 ? 'BULLISH' : s > 0.4 ? 'NEUTRAL' : 'BEARISH'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-14 overflow-hidden">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--void-3)" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${s * 126} 126`}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          <line x1="50" y1="50" x2={needleX} y2={needleY} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
      </div>
      <span className="text-xs font-mono font-medium" style={{ color }}>{label}</span>
      <span className="text-xs text-text-muted">{(s * 100).toFixed(0)}% buy pressure</span>
    </div>
  )
}

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
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
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

function formatPrice(price) {
  if (!price || price === 0) return '0.00'
  if (price < 0.001) return price.toFixed(7)
  if (price < 1) return price.toFixed(4)
  if (price < 100) return price.toFixed(2)
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function TokenDetailDrawer({ token, onClose }) {
  const { data, loading } = useTokenDetail(token?.address)

  const openSwap = () => {
    window.open(`https://jup.ag/swap/SOL-${token.address}`, '_blank')
  }

  if (!token) return null

  const livePrice = data?.overview?.price || token?.price || 0
  const change24h = token?.change24h || 0
  const changePositive = change24h >= 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: 'blur(4px)' }} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
          className="relative z-10 w-full max-w-3xl glass-panel rounded-t-2xl max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-void-3/60" />
          </div>

          {/* ── Header ── */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-void-3/50"
            style={{ background: 'rgba(7,8,10,0.95)', backdropFilter: 'blur(12px)' }}
          >
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
                {livePrice > 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono font-semibold text-text-primary">${formatPrice(livePrice)}</span>
                    <span className={`text-[10px] font-mono font-medium ${changePositive ? 'text-gain' : 'text-loss'}`}>
                      {changePositive ? '+' : ''}{change24h.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openSwap}
                style={{
                  background: 'rgba(199,242,132,0.08)',
                  border: '1px solid rgba(199,242,132,0.25)',
                  color: '#C7F284',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  transition: 'all 180ms ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(199,242,132,0.5)'
                  e.currentTarget.style.background = 'rgba(199,242,132,0.14)'
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(199,242,132,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(199,242,132,0.25)'
                  e.currentTarget.style.background = 'rgba(199,242,132,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                title="Execute swap via Jupiter"
              >
                <svg width="10" height="14" viewBox="0 0 10 14" fill="none"
                  style={{ animation: 'jup-pulse 2s infinite ease-in-out' }}>
                  <path d="M5.8 0L0 8h4.2L3.2 14 10 5.5H5.5L5.8 0z" fill="#C7F284" />
                </svg>
                Execute Swap
              </button>

              <div className="w-px h-4 bg-void-3/50 mx-1" />

              <a
                href={`https://birdeye.so/token/${token.address}?chain=solana`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-void-2 transition-colors text-text-muted hover:text-pulse-400"
                title="View on Birdeye"
              >
                <ExternalLink size={16} />
              </a>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-void-2 transition-colors text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-pulse-400/30 border-t-pulse-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Stats Row */}
              {data?.overview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Market Cap', value: fmtLarge(data.overview.mc) },
                    { label: '24h Volume', value: fmtLarge(data.overview.v24hUSD) },
                    { label: 'Liquidity',  value: fmtLarge(data.overview.liquidity) },
                    { label: 'Holders',    value: data.overview.holder ? data.overview.holder.toLocaleString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-void-1/60 border border-void-3/40">
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
                      <span className="text-sm font-mono font-semibold text-text-primary">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

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

              {/* Signal + Trust */}
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
                        {data.security.hasMintAuthority
                          ? <Unlock size={10} className="text-loss" />
                          : <Lock size={10} className="text-gain" />}
                        <span className="text-text-muted">
                          Mint Authority: {data.security.hasMintAuthority ? 'Active' : 'Revoked'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {data.security.hasFreezeAuthority
                          ? <Unlock size={10} className="text-loss" />
                          : <Lock size={10} className="text-gain" />}
                        <span className="text-text-muted">
                          Freeze Authority: {data.security.hasFreezeAuthority ? 'Active' : 'None'}
                        </span>
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
                  Powered by{' '}
                  <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer"
                    className="text-pulse-400 hover:underline">
                    Birdeye
                  </a>{' '}
                  Data Intelligence
                </p>
              </div>

            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Keyframe for bolt icon pulse */}
      <style>{`@keyframes jup-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </AnimatePresence>
  )
}
