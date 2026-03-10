import { getUserReservations, createReservation } from '@/lib/db-queries'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const reservations = await getUserReservations(userId)

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const {
      parking_lot_id,
      space_id,
      start_time,
      end_time,
      base_price,
      total_price,
      vehicle_plate,
    } = await request.json()

    if (!parking_lot_id || !space_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const reservation = await createReservation({
      id: uuidv4(),
      user_id: userId,
      parking_lot_id,
      space_id,
      start_time,
      end_time,
      status: 'confirmed',
      special_rate_multiplier: 1.0,
      base_price: base_price || 0,
      total_price: total_price || 0,
      vehicle_plate,
      duration_minutes: 0,
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}
