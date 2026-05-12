import { useState, useCallback, useRef, useEffect } from 'react'
import { fetchOHLCV, fetchTopTraders, fetchTokenSecurity, fetchTokenOverview } from './useBirdeyeApi'

/**
 * useTokenDetail
 *
 * Fetches comprehensive data for a single token when the detail drawer opens.
 * Uses 4 Birdeye endpoints: token_overview, ohlcv, top_traders, token_security.
 *
 * Uses a fetchIdRef counter to prevent StrictMode double-mount race conditions.
 */
export function useTokenDetail(address) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchIdRef = useRef(0)

  const fetchDetail = useCallback(async () => {
    if (!address) return

    const fetchId = ++fetchIdRef.current
    setLoading(true)
    setError(null)

    try {
      // Stagger fetches to avoid Birdeye Free Tier rate limits (429 Too Many Requests)
      const fetchWithDelay = async (fetcher, delay) => {
        await new Promise(r => setTimeout(r, delay))
        return fetcher()
      }

      const [overview, ohlcv, traders, security] = await Promise.allSettled([
        fetchTokenOverview(address),
        fetchWithDelay(() => fetchOHLCV(address, '15m'), 200),
        fetchWithDelay(() => fetchTopTraders(address, '24h'), 400),
        fetchWithDelay(() => fetchTokenSecurity(address), 600),
      ])

      // Bail if a newer fetch was initiated (StrictMode remount guard)
      if (fetchId !== fetchIdRef.current) return

      const overviewData = overview.status === 'fulfilled' ? overview.value : null
      const ohlcvData = ohlcv.status === 'fulfilled' ? ohlcv.value : []
      const tradersData = traders.status === 'fulfilled' ? traders.value : null
      const securityData = security.status === 'fulfilled' ? security.value : null

      // Parse top traders
      const topBuyers = (tradersData?.buyers || tradersData || []).slice(0, 5).map(t => ({
        address: t.owner || t.address || '',
        volume: t.volume || t.volumeUSD || 0,
        trades: t.tradeCount || t.trades || 0,
        type: 'buyer',
      }))

      const topSellers = (tradersData?.sellers || tradersData || []).slice(0, 5).map(t => ({
        address: t.owner || t.address || '',
        volume: t.volume || t.volumeUSD || 0,
        trades: t.tradeCount || t.trades || 0,
        type: 'seller',
      }))

      // Calculate signal score from buy/sell data
      // Birdeye uses buy24h/sell24h (transaction counts or volumes)
      // DexScreener fallback uses the same field names
      const buyVol = overviewData?.buy24h || overviewData?.vBuy24hUSD || 0
      const sellVol = overviewData?.sell24h || overviewData?.vSell24hUSD || 0
      const totalVol = buyVol + sellVol
      const signalScore = totalVol > 0 ? buyVol / totalVol : 0.5

      // Parse security
      const securityInfo = securityData ? {
        isVerified: securityData.isToken2022 !== undefined,
        hasMintAuthority: securityData.mutableMetadata || false,
        hasFreezeAuthority: securityData.freezeAuthority !== null,
        top10HolderPercent: securityData.top10HolderPercent || 0,
        creatorPercent: securityData.creatorPercentage || 0,
        creationTime: securityData.creationTime || null,
      } : null

      // Calculate trust score (0-100)
      let trustScore = 70 // Default
      if (securityInfo) {
        trustScore = 100
        if (securityInfo.hasMintAuthority) trustScore -= 20
        if (securityInfo.hasFreezeAuthority) trustScore -= 15
        if (securityInfo.top10HolderPercent > 50) trustScore -= 15
        if (securityInfo.creatorPercent > 30) trustScore -= 10
        trustScore = Math.max(0, trustScore)
      }

      setData({
        overview: overviewData,
        ohlcv: ohlcvData,
        topBuyers,
        topSellers,
        signalScore,
        security: securityInfo,
        trustScore,
      })
      setLoading(false)
    } catch (err) {
      console.warn('[AlphaPulse] Token detail error:', err.message)
      if (fetchId === fetchIdRef.current) {
        setError(err.message)
        setLoading(false)
      }
    }
  }, [address])

  useEffect(() => {
    if (address) fetchDetail()
    return () => { fetchIdRef.current++ }
  }, [address, fetchDetail])

  return { data, loading, error, refetch: fetchDetail }
}
