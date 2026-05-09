import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PROXY_API } from '../config'
import { useApp } from '../context/AppContext'

const SEED_TOKENS = [
  { symbol: 'SOL', name: 'Solana', price: 178.42, change1h: 2.1, change24h: 5.4, volume24h: 3200000000, marketCap: 82000000000, logo: null },
  { symbol: 'JUP', name: 'Jupiter', price: 1.24, change1h: -0.8, change24h: 3.2, volume24h: 180000000, marketCap: 1700000000, logo: null },
  { symbol: 'RAY', name: 'Raydium', price: 5.87, change1h: 1.5, change24h: -2.1, volume24h: 95000000, marketCap: 1600000000, logo: null },
  { symbol: 'ORCA', name: 'Orca', price: 4.32, change1h: 0.3, change24h: 1.8, volume24h: 42000000, marketCap: 430000000, logo: null },
  { symbol: 'BONK', name: 'Bonk', price: 0.0000234, change1h: -1.2, change24h: 12.5, volume24h: 310000000, marketCap: 1500000000, logo: null },
  { symbol: 'WIF', name: 'dogwifhat', price: 2.45, change1h: 3.8, change24h: -4.2, volume24h: 520000000, marketCap: 2400000000, logo: null },
  { symbol: 'PYTH', name: 'Pyth Network', price: 0.42, change1h: -0.5, change24h: 1.9, volume24h: 78000000, marketCap: 1800000000, logo: null },
  { symbol: 'JTO', name: 'Jito', price: 3.76, change1h: 0.9, change24h: -1.3, volume24h: 65000000, marketCap: 900000000, logo: null },
  { symbol: 'RENDER', name: 'Render', price: 10.23, change1h: -2.1, change24h: 7.8, volume24h: 210000000, marketCap: 4000000000, logo: null },
  { symbol: 'HNT', name: 'Helium', price: 8.15, change1h: 0.4, change24h: 2.3, volume24h: 38000000, marketCap: 1400000000, logo: null },
  { symbol: 'KMNO', name: 'Kamino', price: 0.12, change1h: 1.7, change24h: -0.6, volume24h: 18000000, marketCap: 150000000, logo: null },
  { symbol: 'DRIFT', name: 'Drift Protocol', price: 1.08, change1h: -0.3, change24h: 4.5, volume24h: 32000000, marketCap: 320000000, logo: null },
]

const SMART_MONEY_WALLETS = [
  { label: 'Whale Alpha', address: '7xKXp2...9mZr', action: 'Bought', token: 'SOL', amount: '$2.4M', time: '2m ago', pnl: '+12.3%' },
  { label: 'DeFi Degen', address: '3hFnR7...kW2p', action: 'Sold', token: 'WIF', amount: '$890K', time: '5m ago', pnl: '+45.1%' },
  { label: 'VC Fund', address: '9tBqLm...xN4s', action: 'Bought', token: 'JUP', amount: '$1.1M', time: '8m ago', pnl: '+8.7%' },
  { label: 'Smart LP', address: '5kRzNw...eJ7d', action: 'Added LP', token: 'RAY/SOL', amount: '$560K', time: '12m ago', pnl: '+22.0%' },
  { label: 'NFT Whale', address: '2pYvKx...bT3m', action: 'Bought', token: 'RENDER', amount: '$3.2M', time: '15m ago', pnl: '+6.4%' },
  { label: 'Yield Hunter', address: '8mDfWq...aH1r', action: 'Deposited', token: 'KMNO', amount: '$440K', time: '18m ago', pnl: '+31.2%' },
]

function jitter(val, pct) {
  return val * (1 + (Math.random() - 0.5) * 2 * pct)
}

export function useMarketData() {
  const { setVolatilityIndex, triggerPulse } = useApp()
  const [tokens, setTokens] = useState(SEED_TOKENS)
  const [smartMoney, setSmartMoney] = useState(SMART_MONEY_WALLETS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const priceHistory = useRef([])

  const fetchRealData = useCallback(async () => {
    try {
      const url = 'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112'
      const res = await fetch(PROXY_API(url))
      if (res.ok) {
        const data = await res.json()
        if (data.pairs && data.pairs.length > 0) {
          const topPair = data.pairs[0]
          const solPrice = parseFloat(topPair.priceUsd) || 178.42
          setTokens(prev => prev.map(t =>
            t.symbol === 'SOL' ? { ...t, price: solPrice } : t
          ))
        }
      }
    } catch (e) {
      // Silently fall back to simulated data
    }
  }, [])

  const simulateTick = useCallback(() => {
    setTokens(prev => {
      const updated = prev.map(t => {
        const delta1h = (Math.random() - 0.48) * 1.5
        const newPrice = jitter(t.price, 0.003)
        return {
          ...t,
          price: newPrice,
          change1h: t.change1h + delta1h,
          change24h: t.change24h + (Math.random() - 0.5) * 0.3,
          volume24h: jitter(t.volume24h, 0.01),
        }
      })

      const changes = updated.map(t => Math.abs(t.change1h))
      const avg = changes.reduce((a, b) => a + b, 0) / changes.length
      const maxChange = Math.max(...changes)
      const vi = Math.min(1, Math.max(0, (avg / 5 + maxChange / 15)))

      priceHistory.current.push(vi)
      if (priceHistory.current.length > 30) priceHistory.current.shift()

      const smoothVi = priceHistory.current.reduce((a, b) => a + b, 0) / priceHistory.current.length
      setVolatilityIndex(smoothVi)

      return updated
    })

    setSmartMoney(prev => {
      const times = ['just now', '1m ago', '3m ago', '7m ago', '10m ago', '14m ago']
      return prev.map((w, i) => ({ ...w, time: times[i] || w.time }))
    })

    triggerPulse()
  }, [setVolatilityIndex, triggerPulse])

  useEffect(() => {
    fetchRealData().then(() => setLoading(false))
    const fetchInterval = setInterval(fetchRealData, 30000)
    const tickInterval = setInterval(simulateTick, 8000)
    const initTimer = setTimeout(() => setLoading(false), 1500)

    return () => {
      clearInterval(fetchInterval)
      clearInterval(tickInterval)
      clearTimeout(initTimer)
    }
  }, [fetchRealData, simulateTick])

  return { tokens, smartMoney, loading, error }
}
