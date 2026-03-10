-- ParkSmart Database Schema Setup
-- This script creates all necessary tables with proper relationships and indexes
-- RLS policies are applied at the application layer using Supabase Auth

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- USERS & AUTHENTICATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE, -- Supabase auth.users.id
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_photo_url TEXT,
  vehicle_plate TEXT,
  vehicle_type TEXT,
  preferred_payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'manager', -- manager, supervisor, owner
  parking_lot_id UUID,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PARKING LOT & SPACE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS parking_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_spaces INTEGER NOT NULL DEFAULT 0,
  available_spaces INTEGER DEFAULT 0,
  occupied_spaces INTEGER DEFAULT 0,
  reserved_spaces INTEGER DEFAULT 0,
  maintenance_spaces INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  monthly_rate DECIMAL(10, 2),
  is_open_24_7 BOOLEAN DEFAULT TRUE,
  opening_time TIME,
  closing_time TIME,
  has_ev_charging BOOLEAN DEFAULT FALSE,
  has_covered_spaces BOOLEAN DEFAULT FALSE,
  is_handicap_accessible BOOLEAN DEFAULT FALSE,
  parking_type TEXT DEFAULT 'surface', -- surface, garage, valet
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS parking_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Floor A, Section B1, etc.
  zone_number INTEGER,
  total_spaces INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES parking_zones(id),
  space_number TEXT NOT NULL,
  is_handicap BOOLEAN DEFAULT FALSE,
  has_ev_charging BOOLEAN DEFAULT FALSE,
  is_covered BOOLEAN DEFAULT FALSE,
  max_vehicle_height DECIMAL(5, 2),
  last_sensor_reading TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parking_lot_id, space_number)
);

CREATE TABLE IF NOT EXISTS space_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available', -- available, occupied, reserved, maintenance, blocked
  occupied_since TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sensor_data JSONB,
  reservation_id UUID
);

-- ============================================================================
-- RESERVATION & BOOKING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parking_lot_id UUID NOT NULL REFERENCES parking_lots(id),
  space_id UUID NOT NULL REFERENCES parking_spaces(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 60) STORED,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, completed, cancelled, expired
  special_rate_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  base_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  vehicle_plate TEXT,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL, -- card, wallet, subscription
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  refund_amount DECIMAL(10, 2),
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRICING & RULES TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- time_based, demand_based, event_based, duration_based
  start_time TIME,
  end_time TIME,
  day_of_week INTEGER, -- 0=Sunday, 6=Saturday, NULL for all days
  base_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  event_name TEXT,
  occupancy_threshold DECIMAL(5, 2), -- percentage for demand-based pricing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- booking_confirmed, reminder, expiring_soon, price_drop
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reservation_id UUID REFERENCES reservations(id),
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACCESS LOGS & SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id),
  user_id UUID REFERENCES users(id),
  space_id UUID REFERENCES parking_spaces(id),
  event_type TEXT NOT NULL, -- entry, exit, check_in, check_out
  vehicle_plate TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'success', -- success, unauthorized, blocked
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_lot_id ON admins(parking_lot_id);
CREATE INDEX idx_parking_lots_city ON parking_lots(city);
CREATE INDEX idx_parking_lots_admin ON parking_lots(admin_id);
CREATE INDEX idx_parking_zones_lot_id ON parking_zones(parking_lot_id);
CREATE INDEX idx_parking_spaces_lot_id ON parking_spaces(parking_lot_id);
CREATE INDEX idx_parking_spaces_zone_id ON parking_spaces(zone_id);
CREATE INDEX idx_space_status_space_id ON space_status(space_id);
CREATE INDEX idx_space_status_status ON space_status(status);
CREATE INDEX idx_space_status_reservation_id ON space_status(reservation_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_lot_id ON reservations(parking_lot_id);
CREATE INDEX idx_reservations_space_id ON reservations(space_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_end_time ON reservations(end_time);
CREATE INDEX idx_reservations_qr_code ON reservations(qr_code);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_pricing_rules_lot_id ON pricing_rules(parking_lot_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_access_logs_reservation_id ON access_logs(reservation_id);
CREATE INDEX idx_access_logs_space_id ON access_logs(space_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Occupancy Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS occupancy_summary AS
SELECT
  pl.id AS parking_lot_id,
  pl.name,
  pl.total_spaces,
  COALESCE(COUNT(CASE WHEN ss.status = 'occupied' THEN 1 END), 0) AS occupied_count,
  COALESCE(COUNT(CASE WHEN ss.status = 'reserved' THEN 1 END), 0) AS reserved_count,
  COALESCE(COUNT(CASE WHEN ss.status = 'available' THEN 1 END), 0) AS available_count,
  ROUND(100.0 * COALESCE(COUNT(CASE WHEN ss.status IN ('occupied', 'reserved') THEN 1 END), 0) / NULLIF(pl.total_spaces, 0), 2) AS occupancy_percentage,
  MAX(ss.last_updated) AS last_updated
FROM parking_lots pl
LEFT JOIN parking_spaces ps ON pl.id = ps.parking_lot_id
LEFT JOIN space_status ss ON ps.id = ss.space_id
GROUP BY pl.id, pl.name, pl.total_spaces;

CREATE INDEX idx_occupancy_summary_lot_id ON occupancy_summary(parking_lot_id);

-- Revenue Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_summary AS
SELECT
  DATE(p.created_at) AS date,
  pl.id AS parking_lot_id,
  pl.name,
  COUNT(DISTINCT p.reservation_id) AS reservation_count,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed_payments,
  SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) AS failed_payments
FROM payments p
JOIN reservations r ON p.reservation_id = r.id
JOIN parking_lots pl ON r.parking_lot_id = pl.id
GROUP BY DATE(p.created_at), pl.id, pl.name;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment below to insert test data after confirming table creation

-- INSERT INTO parking_lots (name, address, city, state, zip_code, latitude, longitude, total_spaces, hourly_rate, daily_rate)
-- VALUES
--   ('Downtown Garage', '123 Main St', 'San Francisco', 'CA', '94105', 37.7749, -122.4194, 500, 5.00, 20.00),
--   ('Airport Parking', '456 Terminal Rd', 'San Francisco', 'CA', '94128', 37.6213, -122.3790, 1000, 3.00, 15.00),
--   ('Marina Lot', '789 Bay Ave', 'San Francisco', 'CA', '94123', 37.8044, -122.4381, 200, 4.50, 18.00);
