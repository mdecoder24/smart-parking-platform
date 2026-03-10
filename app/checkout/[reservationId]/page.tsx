'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Lock, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { getReservationDetails } from '@/lib/db-queries'

interface ReservationDetails {
  id: string
  total_price: number
  start_time: string
  end_time: string
  vehicle_plate: string
  parking_lots?: {
    name: string
    address: string
  }
  parking_spaces?: {
    space_number: string
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = params.reservationId as string

  const [reservation, setReservation] = useState<ReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Payment form state
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      router.push('/admin/login')
      return
    }

    const fetchReservation = async () => {
      try {
        setLoading(true)
        const data = await getReservationDetails(reservationId)

        if (!data || data.user_id !== userId) {
          setError('Reservation not found or unauthorized')
          return
        }

        setReservation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservation')
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [reservationId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      setError('Please fill in all payment details')
      return
    }

    // Validate card number (basic)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number')
      return
    }

    const userId = localStorage.getItem('user_id')
    if (!userId || !reservation) return

    setProcessing(true)

    try {
      // Create payment intent
      const intentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: reservation.total_price,
          currency: 'usd',
        }),
      })

      if (!intentResponse.ok) {
        const data = await intentResponse.json()
        throw new Error(data.error || 'Failed to create payment intent')
      }

      const intentData = await intentResponse.json()

      // Simulate Stripe payment processing (in production, use Stripe.js)
      // For demo, we'll just confirm the payment immediately
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Confirm payment
      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          paymentId: intentData.paymentId,
          paymentIntentId: intentData.clientSecret,
          status: 'completed',
        }),
      })

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm payment')
      }

      setPaymentSuccess(true)

      // Redirect to booking confirmation
      setTimeout(() => {
        router.push(`/bookings/${reservationId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </main>
    )
  }

  if (!reservation || error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
            <span className="text-red-800">{error || 'Reservation not found'}</span>
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
          <h1 className="text-3xl font-bold text-foreground">Secure Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your parking reservation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Payment Successful!</h3>
              <p className="text-sm text-green-800">Your reservation has been confirmed.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>

            <Card className="p-6 space-y-4">
              {/* Parking Details */}
              <div className="pb-4 border-b border-border">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {reservation.parking_lots?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {reservation.parking_lots?.address}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Space</p>
                  <p className="text-lg font-bold text-foreground">
                    {reservation.parking_spaces?.space_number}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Vehicle</p>
                  <p className="text-lg font-bold text-foreground">
                    {reservation.vehicle_plate}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Start</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(reservation.start_time)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">End</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(reservation.end_time)}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${reservation.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${reservation.total_price.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Payment Details</h2>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Card Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cardholder Name
                  </label>
                  <Input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={processing}
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\s/g, '')
                        value = value.replace(/(\d{4})/g, '$1 ').trim()
                        setCardNumber(value)
                      }}
                      placeholder="1234 5678 9012 3456"
                      required
                      disabled={processing}
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Expiry Date
                    </label>
                    <Input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4)
                        }
                        setExpiryDate(value)
                      }}
                      placeholder="MM/YY"
                      required
                      disabled={processing}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CVV
                    </label>
                    <Input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      required
                      disabled={processing}
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Secure Payment</p>
                    <p>Your payment is encrypted and secure using industry-standard SSL technology.</p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-base"
                  disabled={processing}
                >
                  {processing ? 'Processing Payment...' : `Pay $${reservation.total_price.toFixed(2)}`}
                </Button>

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center">
                  By confirming, you agree to our{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
