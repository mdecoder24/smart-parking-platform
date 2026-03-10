import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const { paymentId, paymentIntentId, status } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      )
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, reservations(id, user_id)')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (payment.reservations.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        stripe_charge_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    // If payment successful, mark reservation as completed and update space status
    if (status === 'completed') {
      // Update reservation status
      await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', payment.reservation_id)

      // Generate QR code (in production, use qrcode library)
      const qrCode = `PARKSMART-${payment.reservation_id.substring(0, 8).toUpperCase()}`

      // Update reservation with QR code
      await supabase
        .from('reservations')
        .update({ qr_code: qrCode })
        .eq('id', payment.reservation_id)

      // Update space status to reserved
      const { data: reservation } = await supabase
        .from('reservations')
        .select('space_id')
        .eq('id', payment.reservation_id)
        .single()

      if (reservation) {
        await supabase
          .from('space_status')
          .update({ status: 'reserved', reservation_id: payment.reservation_id })
          .eq('space_id', reservation.space_id)
      }
    }

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
