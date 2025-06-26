-- Insert initial device names
INSERT INTO device_names (id, prefix, datacenter, last_number)
VALUES
  (gen_random_uuid(), 'SRV', 'MAD', 1000),
  (gen_random_uuid(), 'SRV', 'BCN', 1000),
  (gen_random_uuid(), 'SRV', 'PAR', 1000),
  (gen_random_uuid(), 'SRV', 'LON', 1000),
  (gen_random_uuid(), 'SRV', 'FRA', 1000),
  (gen_random_uuid(), 'SRV', 'AMS', 1000),
  
  (gen_random_uuid(), 'SW', 'MAD', 1000),
  (gen_random_uuid(), 'SW', 'BCN', 1000),
  (gen_random_uuid(), 'SW', 'PAR', 1000),
  (gen_random_uuid(), 'SW', 'LON', 1000),
  (gen_random_uuid(), 'SW', 'FRA', 1000),
  (gen_random_uuid(), 'SW', 'AMS', 1000),
  
  (gen_random_uuid(), 'RT', 'MAD', 1000),
  (gen_random_uuid(), 'RT', 'BCN', 1000),
  (gen_random_uuid(), 'RT', 'PAR', 1000),
  (gen_random_uuid(), 'RT', 'LON', 1000),
  (gen_random_uuid(), 'RT', 'FRA', 1000),
  (gen_random_uuid(), 'RT', 'AMS', 1000),
  
  (gen_random_uuid(), 'STG', 'MAD', 1000),
  (gen_random_uuid(), 'STG', 'BCN', 1000),
  (gen_random_uuid(), 'STG', 'PAR', 1000),
  (gen_random_uuid(), 'STG', 'LON', 1000),
  (gen_random_uuid(), 'STG', 'FRA', 1000),
  (gen_random_uuid(), 'STG', 'AMS', 1000);