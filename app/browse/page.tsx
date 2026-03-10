'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, DollarSign, Zap, Wheelchair, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getParkingLots } from '@/lib/db-queries'
import { staggerContainer, staggerItem, slideInDown, fadeInUp } from '@/lib/animations'
import type { ParkingLot } from '@/lib/types'

export default function BrowsePage() {
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [filteredLots, setFilteredLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchCity, setSearchCity] = useState('')
  const [filters, setFilters] = useState({
    evCharging: false,
    handicapAccess: false,
  })

  useEffect(() => {
    const fetchLots = async () => {
      try {
        setLoading(true)
        const data = await getParkingLots()
        setLots(data)
        setFilteredLots(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load parking lots')
      } finally {
        setLoading(false)
      }
    }

    fetchLots()
  }, [])

  useEffect(() => {
    let filtered = lots

    if (searchCity) {
      filtered = filtered.filter(lot =>
        lot.city.toLowerCase().includes(searchCity.toLowerCase())
      )
    }

    if (filters.evCharging) {
      filtered = filtered.filter(lot => lot.has_ev_charging)
    }

    if (filters.handicapAccess) {
      filtered = filtered.filter(lot => lot.is_handicap_accessible)
    }

    setFilteredLots(filtered)
  }, [lots, searchCity, filters])

  const getOccupancyColor = (lot: ParkingLot) => {
    const occupancy = lot.total_spaces > 0
      ? ((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces) * 100
      : 0

    if (occupancy >= 90) return 'text-red-600'
    if (occupancy >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyBg = (lot: ParkingLot) => {
    const occupancy = lot.total_spaces > 0
      ? ((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces) * 100
      : 0

    if (occupancy >= 90) return 'bg-red-100'
    if (occupancy >= 70) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card sticky top-0 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-6 text-primary hover:text-primary/80">
              <MapPin className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find Parking
          </motion.h1>

          {/* Search and Filters */}
          <div className="space-y-4">
            <Input
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="max-w-sm"
            />

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.evCharging}
                  onChange={(e) => setFilters(prev => ({ ...prev, evCharging: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Zap className="w-4 h-4" />
                <span className="text-sm">EV Charging</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.handicapAccess}
                  onChange={(e) => setFilters(prev => ({ ...prev, handicapAccess: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Wheelchair className="w-4 h-4" />
                <span className="text-sm">Handicap Access</span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading parking lots...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Lots</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No parking lots found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchCity('')
                setFilters({ evCharging: false, handicapAccess: false })
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {filteredLots.map((lot) => {
              const occupancy = lot.total_spaces > 0
                ? ((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces) * 100
                : 0
              const available = lot.available_spaces

              return (
                <motion.div
                  key={lot.id}
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card
                  className="hover:border-primary transition-colors overflow-hidden flex flex-col"
                >
                    {/* Header with Occupancy Badge */}
                    <div className={`${getOccupancyBg(lot)} p-4`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">{lot.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {lot.city}, {lot.state}
                          </p>
                        </div>
                        <div className={`text-center ${getOccupancyColor(lot)}`}>
                          <p className="text-2xl font-bold">{available}</p>
                          <p className="text-xs opacity-75">Available</p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Spaces:</span>
                        <span className="font-semibold">{lot.total_spaces}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className={`font-semibold ${getOccupancyColor(lot)}`}>
                          {occupancy.toFixed(0)}%
                        </span>
                      </div>

                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Hourly Rate</p>
                            <p className="text-xl font-bold text-primary flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {lot.hourly_rate.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Daily Rate</p>
                            <p className="text-xl font-bold text-primary flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {lot.daily_rate.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {(lot.has_ev_charging || lot.has_covered_spaces || lot.is_handicap_accessible) && (
                        <div className="flex gap-2 flex-wrap pt-2">
                          {lot.has_ev_charging && (
                            <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                              <Zap className="w-3 h-3" />
                              EV Charging
                            </span>
                          )}
                          {lot.has_covered_spaces && (
                            <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                              Covered
                            </span>
                          )}
                          {lot.is_handicap_accessible && (
                            <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                              <Wheelchair className="w-3 h-3" />
                              Accessible
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="p-4 border-t border-border">
                      <Link href={`/reserve/${lot.id}`} className="w-full">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full">Reserve a Spot</Button>
                        </motion.div>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </main>
  )
}
