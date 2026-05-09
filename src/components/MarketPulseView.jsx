import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Flame, Zap } from 'lucide-react'
import HoverCard from './HoverCard'

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const listItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 },
  },
}

function formatPrice(price) {
  if (price < 0.001) return price.toFixed(7)
  if (price < 1) return price.toFixed(4)
  if (price < 100) return price.toFixed(2)
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatVolume(vol) {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`
  return `$${(vol / 1e3).toFixed(0)}K`
}

function ChangeTag({ value }) {
  const positive = value >= 0
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium ${
      positive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
    }`}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function MiniSparkline({ change }) {
  const positive = change >= 0
  const color = positive ? '#34D399' : '#F87171'
  const points = useMemo(() => {
    const pts = []
    let y = 50
    for (let i = 0; i < 20; i++) {
      y += (Math.random() - 0.48) * 12
      y = Math.max(10, Math.min(90, y))
      pts.push(`${(i / 19) * 80},${y}`)
    }
    if (positive) pts[pts.length - 1] = `80,${30 + Math.random() * 15}`
    else pts[pts.length - 1] = `80,${60 + Math.random() * 15}`
    return pts.join(' ')
  }, [positive])

  return (
    <svg viewBox="0 0 80 100" className="w-16 h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function MarketPulseView({ tokens, loading }) {
  const topMovers = useMemo(() => {
    return [...tokens]
      .sort((a, b) => Math.abs(b.change1h) - Math.abs(a.change1h))
      .slice(0, 3)
  }, [tokens])

  const solToken = tokens.find(t => t.symbol === 'SOL')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-pulse-400/30 border-t-pulse-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      key="market"
      initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* SOL Price */}
        <HoverCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="text-sm text-text-secondary">SOL / USD</span>
          </div>
          <div className="font-mono text-2xl font-bold text-text-primary">
            ${solToken ? formatPrice(solToken.price) : '—'}
          </div>
          <div className="mt-2 flex items-center gap-3">
            {solToken && <ChangeTag value={solToken.change1h} />}
            {solToken && (
              <span className="text-xs text-text-muted">
                24h: {solToken.change24h >= 0 ? '+' : ''}{solToken.change24h.toFixed(1)}%
              </span>
            )}
          </div>
        </HoverCard>

        {/* Top Movers */}
        <HoverCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-loss" />
            <span className="text-sm text-text-secondary">Top Movers (1h)</span>
          </div>
          <div className="space-y-2">
            {topMovers.map((t, i) => (
              <div key={t.symbol} className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.symbol}</span>
                <ChangeTag value={t.change1h} />
              </div>
            ))}
          </div>
        </HoverCard>

        {/* Smart Money Pulse */}
        <HoverCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-pulse-400" />
            <span className="text-sm text-text-secondary">Smart Money</span>
          </div>
          <div className="font-mono text-2xl font-bold text-pulse-400">Active</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gain animate-pulse" />
            <span className="text-xs text-text-muted">6 wallets tracked live</span>
          </div>
        </HoverCard>
      </div>

      {/* Token Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-void-3/50 flex items-center gap-2">
          <BarChart3 size={16} className="text-signal-400" />
          <h3 className="font-display font-semibold text-sm">Solana Ecosystem</h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-2 text-xs font-medium text-text-muted border-b border-void-3/30">
          <div className="col-span-3 sm:col-span-3">Token</div>
          <div className="col-span-3 sm:col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right hidden sm:block">1h</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-2 text-right hidden sm:block">Volume</div>
          <div className="col-span-1 text-right">Chart</div>
        </div>

        {/* Token Rows */}
        <motion.div variants={listContainer} initial="hidden" animate="visible">
          {tokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              variants={listItem}
              className="grid grid-cols-12 px-5 py-3 items-center border-b border-void-3/20 hover:bg-void-2/30 transition-colors cursor-pointer group"
            >
              <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-void-2 border border-void-3 flex items-center justify-center text-xs font-bold text-pulse-400 group-hover:border-pulse-500/30 transition-colors">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-sm">{token.symbol}</div>
                  <div className="text-xs text-text-muted hidden sm:block">{token.name}</div>
                </div>
              </div>
              <div className={`col-span-3 sm:col-span-2 text-right font-mono text-sm ${
                Math.abs(token.change1h) > 10 ? 'price-glitch' : ''
              }`}>
                ${formatPrice(token.price)}
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <ChangeTag value={token.change1h} />
              </div>
              <div className="col-span-2 text-right">
                <ChangeTag value={token.change24h} />
              </div>
              <div className="col-span-2 text-right hidden sm:block font-mono text-xs text-text-secondary">
                {formatVolume(token.volume24h)}
              </div>
              <div className="col-span-1 flex justify-end">
                <MiniSparkline change={token.change24h} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
