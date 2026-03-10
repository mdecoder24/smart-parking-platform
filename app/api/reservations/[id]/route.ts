import { cancelReservation, getReservationDetails, updateReservation } from '@/lib/db-queries'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const reservation = await getReservationDetails(params.id)

    // Verify ownership
    if (reservation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Get reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const updates = await request.json()

    // Verify ownership before updating
    const existing = await getReservationDetails(params.id)
    if (existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const reservation = await updateReservation(params.id, updates)

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Update reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Verify ownership before canceling
    const existing = await getReservationDetails(params.id)
    if (existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if reservation can be cancelled
    if (existing.status === 'completed' || existing.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel this reservation' },
        { status: 400 }
      )
    }

    const reservation = await cancelReservation(params.id)

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}
