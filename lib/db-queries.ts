import { supabase } from './supabase'
import type {
  ParkingLot,
  ParkingSpace,
  SpaceStatus,
  Reservation,
  User,
  OccupancySummary,
} from './types'

// ============================================================================
// PARKING LOT QUERIES
// ============================================================================

export async function getParkingLots(filters?: {
  city?: string
  hasEvCharging?: boolean
  hasHandicapAccess?: boolean
}) {
  let query = supabase.from('parking_lots').select('*').is('deleted_at', null)

  if (filters?.city) {
    query = query.eq('city', filters.city)
  }
  if (filters?.hasEvCharging) {
    query = query.eq('has_ev_charging', true)
  }
  if (filters?.hasHandicapAccess) {
    query = query.eq('is_handicap_accessible', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ParkingLot[]
}

export async function getParkingLot(id: string) {
  const { data, error } = await supabase
    .from('parking_lots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ParkingLot
}

// ============================================================================
// PARKING SPACE QUERIES
// ============================================================================

export async function getAvailableSpaces(lotId: string) {
  const { data, error } = await supabase
    .from('parking_spaces')
    .select(`
      *,
      space_status (
        id,
        status,
        occupied_since,
        reservation_id
      )
    `)
    .eq('parking_lot_id', lotId)

  if (error) throw error
  return data
}

export async function getSpaceStatus(spaceId: string) {
  const { data, error } = await supabase
    .from('space_status')
    .select('*')
    .eq('space_id', spaceId)
    .order('last_updated', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data as SpaceStatus
}

// ============================================================================
// RESERVATION QUERIES
// ============================================================================

export async function getUserReservations(userId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      parking_lots (id, name, address, city),
      parking_spaces (space_number)
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data
}

export async function getReservationDetails(reservationId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      parking_lots (id, name, address, city, hourly_rate),
      parking_spaces (space_number),
      payments (id, status, amount)
    `)
    .eq('id', reservationId)
    .single()

  if (error) throw error
  return data
}

export async function createReservation(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation])
    .select()
    .single()

  if (error) throw error
  return data as Reservation
}

export async function updateReservation(
  id: string,
  updates: Partial<Omit<Reservation, 'id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Reservation
}

export async function cancelReservation(id: string) {
  const now = new Date().toISOString()
  return updateReservation(id, {
    status: 'cancelled',
    cancelled_at: now,
  })
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as User
}

export async function createOrUpdateUser(user: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .upsert([user], { onConflict: 'email' })
    .select()
    .single()

  if (error) throw error
  return data as User
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getOccupancySummary(lotId?: string) {
  let query = supabase.from('occupancy_summary').select('*')

  if (lotId) {
    query = query.eq('parking_lot_id', lotId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as OccupancySummary[]
}

export async function getRevenueSummary(lotId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('revenue_summary')
    .select('*')
    .eq('parking_lot_id', lotId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToSpaceStatus(
  spaceId: string,
  callback: (status: SpaceStatus) => void
) {
  return supabase
    .channel(`space_status_${spaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'space_status',
        filter: `space_id=eq.${spaceId}`,
      },
      (payload) => {
        callback(payload.new as SpaceStatus)
      }
    )
    .subscribe()
}

export function subscribeToLotOccupancy(
  lotId: string,
  callback: (data: any) => void
) {
  return supabase
    .channel(`lot_occupancy_${lotId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'space_status',
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
}
