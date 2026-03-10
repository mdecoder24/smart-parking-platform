'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { getParkingLot, getAvailableSpaces } from '@/lib/db-queries'
import type { ParkingLot, ParkingSpace, SpaceStatus } from '@/lib/types'

interface SpaceWithStatus extends ParkingSpace {
  space_status?: SpaceStatus[]
}

export default function ReservePage() {
  const params = useParams()
  const router = useRouter()
  const lotId = params.lotId as string

  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [spaces, setSpaces] = useState<SpaceWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reservation state
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('17:00')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lotData, spacesData] = await Promise.all([
          getParkingLot(lotId),
          getAvailableSpaces(lotId),
        ])

        setLot(lotData)
        setSpaces(spacesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load parking lot')
      } finally {
        setLoading(false)
      }
    }

    if (lotId) {
      fetchData()
    }
  }, [lotId])

  const calculatePrice = (): number => {
    if (!startDate || !endDate || !lot) return 0

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    if (hours <= 0) return 0
    if (hours <= 24) {
      return parseFloat((hours * lot.hourly_rate).toFixed(2))
    }
    // Use daily rate if more than 24 hours
    const days = Math.ceil(hours / 24)
    return parseFloat((days * lot.daily_rate).toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!selectedSpace || !startDate || !endDate || !vehiclePlate) {
      setSubmitError('Please fill in all fields')
      return
    }

    const userId = localStorage.getItem('user_id')
    if (!userId) {
      router.push('/admin/login')
      return
    }

    setSubmitting(true)

    try {
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          parking_lot_id: lotId,
          space_id: selectedSpace,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          vehicle_plate: vehiclePlate,
          base_price: calculatePrice(),
          total_price: calculatePrice(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create reservation')
      }

      const reservationData = await response.json()

      setSubmitSuccess(true)

      // Redirect to checkout after 2 seconds
      setTimeout(() => {
        router.push(`/checkout/${reservationData.id}`)
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create reservation')
    } finally {
      setSubmitting(false)
    }
  }

  const getSpaceStatus = (space: SpaceWithStatus): string => {
    if (!space.space_status || space.space_status.length === 0) return 'available'
    return space.space_status[0].status
  }

  const isSpaceAvailable = (space: SpaceWithStatus): boolean => {
    const status = getSpaceStatus(space)
    return status === 'available'
  }

  const price = calculatePrice()

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading parking lot...</p>
      </main>
    )
  }

  if (!lot || error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
            <span className="text-red-800">{error || 'Parking lot not found'}</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/browse" className="inline-flex items-center gap-2 mb-4 text-primary hover:text-primary/80">
            <MapPin className="w-4 h-4" />
            <span>Back to Browse</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{lot.name}</h1>
          <p className="text-muted-foreground mt-1">
            {lot.address} • {lot.city}, {lot.state}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Reservation Confirmed!</h3>
              <p className="text-sm text-green-800">Redirecting to your bookings...</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Select a Space</h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-8">
                {spaces.map((space) => {
                  const available = isSpaceAvailable(space)
                  const isSelected = selectedSpace === space.id

                  return (
                    <button
                      key={space.id}
                      onClick={() => available && setSelectedSpace(space.id)}
                      disabled={!available}
                      className={`p-3 rounded-lg border-2 transition-colors text-sm font-semibold ${
                        !available
                          ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                      }`}
                    >
                      {space.space_number}
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                )}

                {/* Date and Time */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Reservation Period
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Vehicle Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      License Plate
                    </label>
                    <Input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-base"
                  disabled={!selectedSpace || !startDate || !endDate || submitting}
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold text-foreground mb-6">Price Summary</h3>

              {selectedSpace && (
                <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Space</p>
                  <p className="text-2xl font-bold text-primary">
                    {spaces.find(s => s.id === selectedSpace)?.space_number}
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-semibold">${lot.hourly_rate.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span className="font-semibold">${lot.daily_rate.toFixed(2)}/day</span>
                </div>
              </div>

              {startDate && endDate && (
                <>
                  <div className="space-y-2 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">
                        {startDate === endDate
                          ? `${(new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60)}h`
                          : `${Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24))} days`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total Price</span>
                      <span className="text-3xl font-bold text-primary flex items-center">
                        <DollarSign className="w-6 h-6" />
                        {price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Secure payment
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Free cancellation
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  QR code access
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
