import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { fetchTokenList, fetchTrendingTokens } from './useBirdeyeApi'

function jitter(val, pct) {
  return val * (1 + (Math.random() - 0.5) * 2 * pct)
}

export function useMarketData() {
  const { setVolatilityIndex, triggerPulse, pushAlert } = useApp()
  const [tokens, setTokens] = useState([])
  const [trendingAddresses, setTrendingAddresses] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const priceHistory = useRef([])
  const prevPrices = useRef({})
  const cleanupRef = useRef([])

  const calculateVolatility = useCallback((tokenList) => {
    const changes = tokenList.map(t => Math.abs(t.change1h || 0))
    const avg = changes.reduce((a, b) => a + b, 0) / (changes.length || 1)
    const maxChange = Math.max(0, ...changes)
    const vi = Math.min(1, Math.max(0, (avg / 5 + maxChange / 15)))
    priceHistory.current.push(vi)
    if (priceHistory.current.length > 30) priceHistory.current.shift()
    const smoothVi = priceHistory.current.reduce((a, b) => a + b, 0) / priceHistory.current.length
    setVolatilityIndex(smoothVi)
  }, [setVolatilityIndex])

  const fetchRealData = useCallback(async () => {
    try {
      const rawTokens = await fetchTokenList(10)
      if (!rawTokens || rawTokens.length === 0) return false

      const enriched = rawTokens.map(t => ({
        symbol: t.symbol || 'UNKNOWN',
        name: t.name || t.symbol || 'Unknown',
        price: t.price || 0,
        change1h: t.priceChange1hPercent ?? 0,
        change24h: t.priceChange24hPercent || 0,
        volume24h: t.v24hUSD || 0,
        marketCap: t.mc || t.marketCap || 0,
        address: t.address,
        logoURI: t.logoURI || null,
        buyVolume24h: t.buy24h || 0,
        sellVolume24h: t.sell24h || 0,
      }))

      enriched.forEach(token => {
        const prev = prevPrices.current[token.symbol]
        if (prev) {
          const pctChange = ((token.price - prev) / prev) * 100
          if (Math.abs(pctChange) > 3) {
            pushAlert({
              label: `${token.symbol} ${pctChange > 0 ? 'Surge' : 'Drop'}`,
              action: pctChange > 0 ? 'Pumped' : 'Dumped',
              token: token.symbol,
              amount: `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%`,
            })
          }
        }
        prevPrices.current[token.symbol] = token.price
      })

      setTokens(enriched)
      calculateVolatility(enriched)
      setLastUpdate(new Date())
      setError(null)
      triggerPulse()
      return true
    } catch (err) {
      console.warn('[AlphaPulse] Data fetch failed:', err.message)
      setError(err.message)
      return false
    }
  }, [calculateVolatility, triggerPulse, pushAlert])

  const fetchTrending = useCallback(async () => {
    try {
      const trending = await fetchTrendingTokens(20)
      const addresses = new Set(trending.map(t => t.address))
      setTrendingAddresses(addresses)
    } catch { /* Non-critical */ }
  }, [])

  const simulateTick = useCallback(() => {
    setTokens(prev => {
      if (prev.length === 0) return prev
      const updated = prev.map(t => ({
        ...t,
        price: jitter(t.price, 0.002),
        change1h: t.change1h + (Math.random() - 0.48) * 0.8,
        change24h: t.change24h + (Math.random() - 0.5) * 0.15,
        volume24h: jitter(t.volume24h, 0.005),
      }))
      calculateVolatility(updated)
      return updated
    })
  }, [calculateVolatility])

  useEffect(() => {
    let mounted = true

    async function init() {
      await fetchRealData()
      if (mounted) setLoading(false)
      fetchTrending()

      // Poll every 30s
      const fetchTimer = setInterval(() => { if (mounted) fetchRealData() }, 30_000)
      cleanupRef.current.push(() => clearInterval(fetchTimer))

      // Trending every 120s
      const trendTimer = setInterval(() => { if (mounted) fetchTrending() }, 120_000)
      cleanupRef.current.push(() => clearInterval(trendTimer))

      // Gentle jitter every 6s
      const tickTimer = setInterval(() => { if (mounted) simulateTick() }, 6_000)
      cleanupRef.current.push(() => clearInterval(tickTimer))

      // Safety loading timeout
      const safetyTimer = setTimeout(() => { if (mounted) setLoading(false) }, 3000)
      cleanupRef.current.push(() => clearTimeout(safetyTimer))
    }

    init()
    return () => {
      mounted = false
      cleanupRef.current.forEach(fn => fn())
      cleanupRef.current = []
    }
  }, [fetchRealData, fetchTrending, simulateTick])

  return { tokens, trendingAddresses, loading, error, lastUpdate }
}
