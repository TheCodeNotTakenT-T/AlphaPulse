import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchWalletPortfolio } from './useBirdeyeApi'

/**
 * useWalletPortfolio
 *
 * When a wallet is connected, fetches real token holdings from
 * Birdeye's /v1/wallet/token_list endpoint. Calculates total value
 * and formats holdings for display.
 */
export function useWalletPortfolio(walletPublicKey) {
  const [holdings, setHoldings] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  const fetchPortfolio = useCallback(async () => {
    if (!walletPublicKey) return

    setLoading(true)
    try {
      const data = await fetchWalletPortfolio(walletPublicKey)

      if (!data) {
        setHoldings([])
        setTotalValue(0)
        setLoading(false)
        return
      }

      // Parse wallet tokens
      const items = data.items || data || []
      let total = 0

      const parsed = items
        .filter(item => {
          const usdValue = item.valueUsd || (item.uiAmount * (item.priceUsd || 0))
          return usdValue > 0.01 // Filter dust
        })
        .map(item => {
          const usdValue = item.valueUsd || (item.uiAmount * (item.priceUsd || 0))
          total += usdValue

          return {
            symbol: item.symbol || 'UNKNOWN',
            name: item.name || item.symbol || 'Unknown Token',
            amount: item.uiAmount?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || '0',
            rawAmount: item.uiAmount || 0,
            value: usdValue,
            valueFormatted: formatUSD(usdValue),
            priceUsd: item.priceUsd || 0,
            change24h: item.priceChange24hPercent || 0,
            address: item.address || '',
            logoURI: item.logoURI || item.icon || null,
          }
        })
        .sort((a, b) => b.value - a.value) // Sort by value descending
        .slice(0, 20) // Top 20 holdings

      if (mounted.current) {
        setHoldings(parsed)
        setTotalValue(total)
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      console.warn('[AlphaPulse] Portfolio fetch error:', err.message)
      if (mounted.current) {
        setError(err.message)
        setLoading(false)
      }
    }
  }, [walletPublicKey])

  useEffect(() => {
    mounted.current = true

    if (walletPublicKey) {
      fetchPortfolio()
      const interval = setInterval(fetchPortfolio, 30_000) // Refresh every 30s
      return () => {
        mounted.current = false
        clearInterval(interval)
      }
    } else {
      setHoldings([])
      setTotalValue(0)
    }

    return () => { mounted.current = false }
  }, [walletPublicKey, fetchPortfolio])

  return { holdings, totalValue, loading, error, refetch: fetchPortfolio }
}

function formatUSD(val) {
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
  if (val >= 1e3) return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (val >= 1) return `$${val.toFixed(2)}`
  return `$${val.toFixed(4)}`
}
