import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Note: In production, you would use the Stripe Node SDK
// This is a simplified example showing the integration pattern
// Requires: npm install stripe

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const { reservationId, amount, currency = 'usd' } = await request.json()

    if (!reservationId || !amount) {
      return NextResponse.json(
        { error: 'Reservation ID and amount are required' },
        { status: 400 }
      )
    }

    // Validate reservation belongs to user
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('id, user_id, total_price')
      .eq('id', reservationId)
      .single()

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate amount matches
    if (Math.abs(amount - reservation.total_price) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // In production, create Stripe PaymentIntent here
    // For now, we'll return a mock client secret
    const clientSecret = `pi_${Math.random().toString(36).substr(2, 24)}_secret_${Math.random().toString(36).substr(2, 24)}`

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          reservation_id: reservationId,
          user_id: userId,
          amount,
          currency,
          payment_method: 'card',
          status: 'pending',
          stripe_payment_intent_id: clientSecret.split('_secret_')[0],
        },
      ])
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret,
      paymentId: payment.id,
      amount,
      currency,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
