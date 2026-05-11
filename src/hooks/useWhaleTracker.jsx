import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { fetchTopTraders } from './useBirdeyeApi'

// ─── Known "interesting" token addresses to track ──────────────
const TRACKED_TOKENS = [
  { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'JUP', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
  { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
]

function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr || ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatAmount(vol) {
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`
  return `$${vol.toFixed(0)}`
}

/**
 * useWhaleTracker
 * 
 * Fetches top traders (whales) for key Solana tokens using Birdeye's
 * /defi/v2/tokens/top_traders endpoint. Surfaces large trades as
 * smart money activity and pushes toast alerts for new detections.
 */
export function useWhaleTracker() {
  const { pushAlert } = useApp()
  const [whaleActivity, setWhaleActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const seenTraders = useRef(new Set())
  const mounted = useRef(true)

  const fetchWhales = useCallback(async () => {
    try {
      const allTraders = []

      // Fetch top traders for each tracked token (staggered)
      for (let i = 0; i < TRACKED_TOKENS.length; i++) {
        const { symbol, address } = TRACKED_TOKENS[i]
        if (i > 0) await new Promise(r => setTimeout(r, 300))

        try {
          const traders = await fetchTopTraders(address, '24h')

          // Take top 2 traders per token
          const topBuyers = (traders?.buyers || traders || []).slice(0, 2)
          const topSellers = (traders?.sellers || traders || []).slice(0, 1)

          topBuyers.forEach(t => {
            const key = `${t.owner || t.address}-${symbol}-buy`
            const volume = t.volume || t.volumeUSD || 0
            if (volume > 10000) {
              allTraders.push({
                label: volume > 1000000 ? 'Whale' : volume > 100000 ? 'Smart Money' : 'Active Trader',
                address: shortenAddress(t.owner || t.address || ''),
                fullAddress: t.owner || t.address || '',
                action: 'Bought',
                token: symbol,
                amount: formatAmount(volume),
                volume,
                time: 'recently',
                pnl: t.pnl ? `${t.pnl > 0 ? '+' : ''}${t.pnl.toFixed(1)}%` : '+0.0%',
                _key: key,
              })
            }
          })

          topSellers.forEach(t => {
            const key = `${t.owner || t.address}-${symbol}-sell`
            const volume = t.volume || t.volumeUSD || 0
            if (volume > 10000) {
              allTraders.push({
                label: volume > 1000000 ? 'Whale' : volume > 100000 ? 'Smart Money' : 'Active Trader',
                address: shortenAddress(t.owner || t.address || ''),
                fullAddress: t.owner || t.address || '',
                action: 'Sold',
                token: symbol,
                amount: formatAmount(volume),
                volume,
                time: 'recently',
                pnl: t.pnl ? `${t.pnl > 0 ? '+' : ''}${t.pnl.toFixed(1)}%` : '+0.0%',
                _key: key,
              })
            }
          })
        } catch {
          // Skip this token if it fails
        }
      }

      // Sort by volume descending
      allTraders.sort((a, b) => b.volume - a.volume)
      const top = allTraders.slice(0, 8)

      // Push alert for new whales
      top.forEach(t => {
        if (!seenTraders.current.has(t._key) && t.volume > 100000) {
          seenTraders.current.add(t._key)
          pushAlert({
            label: t.label,
            action: t.action,
            token: t.token,
            amount: t.amount,
          })
        }
      })

      // Assign relative times
      const times = ['just now', '2m ago', '5m ago', '8m ago', '12m ago', '18m ago', '25m ago', '30m ago']
      const withTimes = top.map((t, i) => ({ ...t, time: times[i] || '30m+ ago' }))

      if (mounted.current) {
        setWhaleActivity(withTimes)
        setLoading(false)
      }
    } catch (err) {
      console.warn('[AlphaPulse] Whale tracker error:', err.message)
      if (mounted.current) setLoading(false)
    }
  }, [pushAlert])

  useEffect(() => {
    mounted.current = true
    fetchWhales()

    const interval = setInterval(fetchWhales, 120_000) // Refresh every 2m instead of 30s

    return () => {
      mounted.current = false
      clearInterval(interval)
    }
  }, [fetchWhales])

  return { whaleActivity, loading }
}
