export interface User {
  id: string
  auth_id?: string
  email: string
  phone?: string
  first_name?: string
  last_name?: string
  profile_photo_url?: string
  vehicle_plate?: string
  vehicle_type?: string
  preferred_payment_method?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Admin {
  id: string
  user_id: string
  role: 'manager' | 'supervisor' | 'owner'
  parking_lot_id?: string
  permissions: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface ParkingLot {
  id: string
  admin_id?: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  zip_code?: string
  latitude: number
  longitude: number
  total_spaces: number
  available_spaces: number
  occupied_spaces: number
  reserved_spaces: number
  maintenance_spaces: number
  hourly_rate: number
  daily_rate: number
  monthly_rate?: number
  is_open_24_7: boolean
  opening_time?: string
  closing_time?: string
  has_ev_charging: boolean
  has_covered_spaces: boolean
  is_handicap_accessible: boolean
  parking_type: 'surface' | 'garage' | 'valet'
  last_updated: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ParkingZone {
  id: string
  parking_lot_id: string
  name: string
  zone_number?: number
  total_spaces: number
  created_at: string
  updated_at: string
}

export interface ParkingSpace {
  id: string
  parking_lot_id: string
  zone_id?: string
  space_number: string
  is_handicap: boolean
  has_ev_charging: boolean
  is_covered: boolean
  max_vehicle_height?: number
  last_sensor_reading?: string
  created_at: string
  updated_at: string
}

export interface SpaceStatus {
  id: string
  space_id: string
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked'
  occupied_since?: string
  last_updated: string
  sensor_data?: Record<string, unknown>
  reservation_id?: string
}

export interface Reservation {
  id: string
  user_id: string
  parking_lot_id: string
  space_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: 'confirmed' | 'completed' | 'cancelled' | 'expired'
  special_rate_multiplier: number
  base_price: number
  total_price: number
  notes?: string
  vehicle_plate?: string
  qr_code?: string
  created_at: string
  updated_at: string
  cancelled_at?: string
}

export interface Payment {
  id: string
  reservation_id: string
  user_id: string
  amount: number
  currency: string
  payment_method: 'card' | 'wallet' | 'subscription'
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  refund_amount?: number
  refunded_at?: string
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  parking_lot_id: string
  name: string
  rule_type: 'time_based' | 'demand_based' | 'event_based' | 'duration_based'
  start_time?: string
  end_time?: string
  day_of_week?: number
  base_multiplier: number
  is_active: boolean
  start_date?: string
  end_date?: string
  event_name?: string
  occupancy_threshold?: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'booking_confirmed' | 'reminder' | 'expiring_soon' | 'price_drop'
  title: string
  message: string
  reservation_id?: string
  is_read: boolean
  sent_at: string
  created_at: string
}

export interface AccessLog {
  id: string
  reservation_id?: string
  user_id?: string
  space_id?: string
  event_type: 'entry' | 'exit' | 'check_in' | 'check_out'
  vehicle_plate?: string
  timestamp: string
  status: 'success' | 'unauthorized' | 'blocked'
  notes?: string
  created_at: string
}

export interface OccupancySummary {
  parking_lot_id: string
  name: string
  total_spaces: number
  occupied_count: number
  reserved_count: number
  available_count: number
  occupancy_percentage: number
  last_updated: string
}

export interface RevenueSummary {
  date: string
  parking_lot_id: string
  name: string
  reservation_count: number
  total_revenue: number
  completed_payments: number
  failed_payments: number
}
