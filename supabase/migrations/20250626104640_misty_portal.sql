-- PostgreSQL Initial Schema for DataCenter Manager
-- This script creates the database schema for the DataCenter Manager application

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For password hashing

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_date TIMESTAMP NOT NULL,
  datacenter VARCHAR(50) NOT NULL,
  project_name VARCHAR(200) NOT NULL,
  client VARCHAR(200) NOT NULL,
  ritm_code VARCHAR(50) NOT NULL,
  project_code VARCHAR(200) NOT NULL,
  estimated_equipment INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  progress INT NOT NULL DEFAULT 0,
  teams_url VARCHAR(500) NULL,
  excel_path VARCHAR(500) NULL,
  ocr_method VARCHAR(50) NOT NULL DEFAULT 'ai',
  ai_provider_id UUID NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  estimated_equipment INT NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create DeliveryNotes table
CREATE TABLE IF NOT EXISTS delivery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  estimated_equipment INT NOT NULL DEFAULT 0,
  delivered_equipment INT NOT NULL DEFAULT 0,
  verified_equipment INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  progress INT NOT NULL DEFAULT 0,
  attachment_path VARCHAR(500) NULL,
  attachment_type VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create EstimatedEquipments table
CREATE TABLE IF NOT EXISTS estimated_equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  assigned_equipment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Equipments table
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  serial_number VARCHAR(100) NULL,
  part_number VARCHAR(100) NULL,
  device_name VARCHAR(100) NULL,
  type VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  photo_path VARCHAR(500) NULL,
  is_matched BOOLEAN NOT NULL DEFAULT FALSE,
  matched_with_id UUID NULL,
  estimated_equipment_id UUID NULL REFERENCES estimated_equipments(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create DeviceNames table
CREATE TABLE IF NOT EXISTS device_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix VARCHAR(10) NOT NULL,
  datacenter VARCHAR(50) NOT NULL,
  last_number INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NULL,
  version VARCHAR(50) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Users and Authentication tables
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  resource VARCHAR(200) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_group_permissions (
  user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  department VARCHAR(200) NULL,
  location VARCHAR(200) NULL,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  user_group_id UUID NULL REFERENCES user_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  resolution_date TIMESTAMP NULL,
  resolution_description TEXT NULL,
  resolution_technician VARCHAR(200) NULL,
  photo_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Incident Comments table
CREATE TABLE IF NOT EXISTS incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author VARCHAR(200) NOT NULL,
  photo_path VARCHAR(500) NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_progress ON projects(progress);
CREATE INDEX IF NOT EXISTS idx_projects_datacenter ON projects(datacenter);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);

CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_progress ON orders(progress);

CREATE INDEX IF NOT EXISTS idx_delivery_notes_order_id ON delivery_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_status ON delivery_notes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_progress ON delivery_notes(progress);

CREATE INDEX IF NOT EXISTS idx_equipments_delivery_note_id ON equipments(delivery_note_id);
CREATE INDEX IF NOT EXISTS idx_equipments_estimated_equipment_id ON equipments(estimated_equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipments_is_verified ON equipments(is_verified);
CREATE INDEX IF NOT EXISTS idx_equipments_is_matched ON equipments(is_matched);
CREATE INDEX IF NOT EXISTS idx_equipments_serial_number ON equipments(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipments_device_name ON equipments(device_name);

CREATE INDEX IF NOT EXISTS idx_estimated_equipments_project_id ON estimated_equipments(project_id);
CREATE INDEX IF NOT EXISTS idx_estimated_equipments_type ON estimated_equipments(type);
CREATE INDEX IF NOT EXISTS idx_estimated_equipments_model ON estimated_equipments(model);

CREATE INDEX IF NOT EXISTS idx_device_names_prefix_datacenter ON device_names(prefix, datacenter);

CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);
CREATE INDEX IF NOT EXISTS idx_ai_providers_is_default ON ai_providers(is_default);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_group_id ON users(user_group_id);

CREATE INDEX IF NOT EXISTS idx_incidents_equipment_id ON incidents(equipment_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_id ON incident_comments(incident_id);