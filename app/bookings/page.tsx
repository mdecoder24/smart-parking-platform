'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Calendar, Clock, AlertCircle, QrCode } from 'lucide-react'
import { getUserReservations } from '@/lib/db-queries'
import type { Reservation } from '@/lib/types'

interface ReservationWithDetails {
  id: string
  status: string
  start_time: string
  end_time: string
  total_price: number
  vehicle_plate: string
  qr_code?: string
  parking_lots?: {
    name: string
    address: string
    city: string
  }
  parking_spaces?: {
    space_number: string
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      router.push('/admin/login')
      return
    }

    const fetchReservations = async () => {
      try {
        setLoading(true)
        const data = await getUserReservations(userId)
        setReservations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations')
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your bookings...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
                <MapPin className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your parking reservations
              </p>
            </div>
            <Link href="/browse">
              <Button>Book More</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by browsing available parking lots and making your first reservation.
            </p>
            <Link href="/browse">
              <Button>Browse Parking</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Upcoming Reservations */}
            {reservations.filter(r => isUpcoming(r.start_time)).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Upcoming</h2>
                <div className="grid gap-4">
                  {reservations
                    .filter(r => isUpcoming(r.start_time))
                    .map((reservation) => (
                      <Card key={reservation.id} className="p-6 hover:border-primary transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            {/* Location */}
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {reservation.parking_lots?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                              <MapPin className="w-4 h-4" />
                              {reservation.parking_lots?.address} • {reservation.parking_lots?.city}
                            </p>

                            {/* Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              {/* Space Number */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Space</p>
                                <p className="text-lg font-bold text-foreground">
                                  {reservation.parking_spaces?.space_number}
                                </p>
                              </div>

                              {/* Date and Time */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Date
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {formatDate(reservation.start_time)}
                                </p>
                              </div>

                              {/* Start Time */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Start
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {formatTime(reservation.start_time)}
                                </p>
                              </div>

                              {/* End Time */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  End
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {formatTime(reservation.end_time)}
                                </p>
                              </div>

                              {/* Vehicle */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Vehicle</p>
                                <p className="text-lg font-bold text-foreground">
                                  {reservation.vehicle_plate}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="bg-primary/10 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Total Price</p>
                                <p className="text-lg font-bold text-primary">
                                  ${reservation.total_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex flex-col items-end justify-between">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>

                            {reservation.qr_code && (
                              <div className="mt-4">
                                <div className="w-32 h-32 bg-white border-2 border-border rounded-lg p-2 flex items-center justify-center">
                                  {/* QR Code placeholder - in production, use qr-code library */}
                                  <div className="text-center">
                                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">QR Code</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Past Reservations */}
            {reservations.filter(r => !isUpcoming(r.start_time)).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 mt-8">Past Reservations</h2>
                <div className="grid gap-4">
                  {reservations
                    .filter(r => !isUpcoming(r.start_time))
                    .map((reservation) => (
                      <Card key={reservation.id} className="p-6 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {reservation.parking_lots?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                              <MapPin className="w-4 h-4" />
                              {reservation.parking_lots?.city}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(reservation.start_time)} • Space {reservation.parking_spaces?.space_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>
                            <p className="text-lg font-bold text-foreground mt-2">
                              ${reservation.total_price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
