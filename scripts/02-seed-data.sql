-- ParkSmart Sample Data
-- This script inserts test data for development and demonstration

-- Sample Users
INSERT INTO users (email, phone, first_name, last_name, vehicle_plate, vehicle_type) VALUES
('john@example.com', '415-555-0101', 'John', 'Doe', 'ABC123', 'sedan'),
('jane@example.com', '415-555-0102', 'Jane', 'Smith', 'XYZ789', 'suv'),
('admin@example.com', '415-555-0103', 'Admin', 'User', 'ADMIN01', 'sedan');

-- Sample Admin User
INSERT INTO admins (user_id, role, permissions)
SELECT id, 'owner', '{"manage_pricing": true, "view_analytics": true, "manage_staff": true}'
FROM users WHERE email = 'admin@example.com' LIMIT 1;

-- Sample Parking Lots
INSERT INTO parking_lots (
  admin_id, name, description, address, city, state, zip_code,
  latitude, longitude, total_spaces, hourly_rate, daily_rate, monthly_rate,
  is_open_24_7, has_ev_charging, has_covered_spaces, is_handicap_accessible, parking_type
)
SELECT 
  id, 
  'Downtown Garage', 
  'Premium covered parking in downtown San Francisco',
  '123 Market Street',
  'San Francisco',
  'CA',
  '94105',
  37.7749,
  -122.4194,
  500,
  5.50,
  22.00,
  450.00,
  true,
  true,
  true,
  true,
  'garage'
FROM admins WHERE user_id = (SELECT id FROM users WHERE email = 'admin@example.com') LIMIT 1;

INSERT INTO parking_lots (
  name, description, address, city, state, zip_code,
  latitude, longitude, total_spaces, hourly_rate, daily_rate, monthly_rate,
  is_open_24_7, has_ev_charging, has_covered_spaces, is_handicap_accessible, parking_type
) VALUES
(
  'Airport Long-Term Parking',
  'Convenient parking for airport trips',
  '456 Terminal Road',
  'San Francisco',
  'CA',
  '94128',
  37.6213,
  -122.3790,
  1000,
  3.00,
  15.00,
  300.00,
  true,
  false,
  false,
  true,
  'surface'
),
(
  'Marina District Lot',
  'Convenient street-side parking near shops and restaurants',
  '789 Bay Street',
  'San Francisco',
  'CA',
  '94123',
  37.8044,
  -122.4381,
  200,
  4.50,
  18.00,
  NULL,
  false,
  false,
  false,
  true,
  'surface'
);

-- Sample Parking Zones
INSERT INTO parking_zones (parking_lot_id, name, zone_number, total_spaces)
SELECT id, 'Level A', 1, 120 FROM parking_lots WHERE name = 'Downtown Garage' LIMIT 1;

INSERT INTO parking_zones (parking_lot_id, name, zone_number, total_spaces)
SELECT id, 'Level B', 2, 150 FROM parking_lots WHERE name = 'Downtown Garage' LIMIT 1;

INSERT INTO parking_zones (parking_lot_id, name, zone_number, total_spaces)
SELECT id, 'Long-Term A', 1, 500 FROM parking_lots WHERE name = 'Airport Long-Term Parking' LIMIT 1;

-- Sample Parking Spaces
INSERT INTO parking_spaces (parking_lot_id, zone_id, space_number, is_handicap, has_ev_charging, is_covered)
SELECT pl.id, pz.id, 'A-' || (ROW_NUMBER() OVER (ORDER BY pz.id) + 0)::TEXT, 
  (ROW_NUMBER() OVER (ORDER BY pz.id) % 20 = 0), 
  (ROW_NUMBER() OVER (ORDER BY pz.id) % 10 = 0),
  true
FROM parking_lots pl
CROSS JOIN parking_zones pz
WHERE pl.name = 'Downtown Garage' AND pz.name = 'Level A'
LIMIT 120;

-- Add more spaces for Level B
INSERT INTO parking_spaces (parking_lot_id, zone_id, space_number, is_covered)
SELECT pl.id, pz.id, 'B-' || (ROW_NUMBER() OVER (ORDER BY pz.id) + 120)::TEXT, true
FROM parking_lots pl
CROSS JOIN parking_zones pz
WHERE pl.name = 'Downtown Garage' AND pz.name = 'Level B'
LIMIT 150;

-- Add spaces for Airport lot
INSERT INTO parking_spaces (parking_lot_id, zone_id, space_number)
SELECT pl.id, pz.id, 'LT-' || (ROW_NUMBER() OVER (ORDER BY pz.id))::TEXT
FROM parking_lots pl
CROSS JOIN parking_zones pz
WHERE pl.name = 'Airport Long-Term Parking' AND pz.name = 'Long-Term A'
LIMIT 500;

-- Add spaces for Marina lot
INSERT INTO parking_spaces (parking_lot_id, space_number)
SELECT id, 'M-' || (ROW_NUMBER() OVER (ORDER BY id))::TEXT
FROM parking_lots
WHERE name = 'Marina District Lot'
LIMIT 200;

-- Initialize space status for all spaces
INSERT INTO space_status (space_id, status)
SELECT id, 'available' FROM parking_spaces;

-- Update some spaces to different statuses
UPDATE space_status
SET status = 'occupied', occupied_since = NOW() - INTERVAL '2 hours'
WHERE space_id IN (SELECT id FROM parking_spaces LIMIT 150);

UPDATE space_status
SET status = 'reserved', occupied_since = NOW()
WHERE space_id IN (SELECT id FROM parking_spaces OFFSET 150 LIMIT 50);

-- Sample Pricing Rules
INSERT INTO pricing_rules (parking_lot_id, name, rule_type, start_time, end_time, day_of_week, base_multiplier)
SELECT id, 'Peak Hours Weekday', 'time_based', '08:00:00'::TIME, '18:00:00'::TIME, 1, 1.5
FROM parking_lots WHERE name = 'Downtown Garage' LIMIT 1;

INSERT INTO pricing_rules (parking_lot_id, name, rule_type, start_time, end_time, day_of_week, base_multiplier)
SELECT id, 'Evening Rate', 'time_based', '18:00:00'::TIME, '23:59:59'::TIME, 1, 1.0
FROM parking_lots WHERE name = 'Downtown Garage' LIMIT 1;

-- Sample Reservations
INSERT INTO reservations (user_id, parking_lot_id, space_id, start_time, end_time, status, base_price, total_price)
SELECT 
  u.id, 
  pl.id,
  ps.id,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 2 hours',
  'confirmed',
  11.00,
  11.00
FROM users u
CROSS JOIN parking_lots pl
CROSS JOIN parking_spaces ps
WHERE u.email = 'john@example.com' AND pl.name = 'Downtown Garage'
LIMIT 1;

-- Sample Payments
INSERT INTO payments (reservation_id, user_id, amount, payment_method, status)
SELECT r.id, r.user_id, r.total_price, 'card', 'completed'
FROM reservations r
WHERE r.status = 'confirmed'
LIMIT 1;

-- Update parking lot summary statistics
UPDATE parking_lots
SET 
  available_spaces = (SELECT COUNT(*) FROM parking_spaces WHERE parking_lot_id = parking_lots.id AND id NOT IN (SELECT space_id FROM space_status WHERE status IN ('occupied', 'reserved', 'maintenance'))),
  occupied_spaces = (SELECT COUNT(*) FROM space_status WHERE space_id IN (SELECT id FROM parking_spaces WHERE parking_lot_id = parking_lots.id) AND status = 'occupied'),
  reserved_spaces = (SELECT COUNT(*) FROM space_status WHERE space_id IN (SELECT id FROM parking_spaces WHERE parking_lot_id = parking_lots.id) AND status = 'reserved'),
  last_updated = NOW();
