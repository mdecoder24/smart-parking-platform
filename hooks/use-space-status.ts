import { useEffect, useState } from 'react'
import { subscribeToSpaceStatus, subscribeToLotOccupancy } from '@/lib/db-queries'
import type { SpaceStatus } from '@/lib/types'

export function useSpaceStatus(spaceId: string | null) {
  const [status, setStatus] = useState<SpaceStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!spaceId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const subscription = subscribeToSpaceStatus(spaceId, (newStatus) => {
      setStatus(newStatus)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [spaceId])

  return { status, loading }
}

export function useLotOccupancy(lotId: string | null) {
  const [occupancy, setOccupancy] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lotId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const subscription = subscribeToLotOccupancy(lotId, (data) => {
      setOccupancy(data)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [lotId])

  return { occupancy, loading }
}
