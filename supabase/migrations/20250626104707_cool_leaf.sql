-- PostgreSQL Stored Functions for DataCenter Manager
-- This script creates the PostgreSQL functions (equivalent to SQL Server stored procedures)

-- Function to create a project
CREATE OR REPLACE FUNCTION sp_createproject(
  p_delivery_date TIMESTAMP,
  p_datacenter VARCHAR(50),
  p_project_name VARCHAR(200),
  p_client VARCHAR(200),
  p_ritm_code VARCHAR(50),
  p_project_code VARCHAR(200),
  p_estimated_equipment INT,
  p_status VARCHAR(50),
  p_progress INT,
  p_teams_url VARCHAR(500),
  p_excel_path VARCHAR(500),
  p_ocr_method VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO projects (
    id, delivery_date, datacenter, project_name, client, ritm_code, project_code,
    estimated_equipment, status, progress, teams_url, excel_path, ocr_method
  )
  VALUES (
    new_id, p_delivery_date, p_datacenter, p_project_name, p_client, p_ritm_code, p_project_code,
    p_estimated_equipment, p_status, p_progress, p_teams_url, p_excel_path, p_ocr_method
  );
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create an order
CREATE OR REPLACE FUNCTION sp_createorder(
  p_project_id UUID,
  p_code VARCHAR(50),
  p_estimated_equipment INT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO orders (id, project_id, code, estimated_equipment)
  VALUES (new_id, p_project_id, p_code, p_estimated_equipment);
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a delivery note
CREATE OR REPLACE FUNCTION sp_createdeliverynote(
  p_order_id UUID,
  p_code VARCHAR(50),
  p_estimated_equipment INT,
  p_status VARCHAR(50),
  p_attachment_path VARCHAR(500),
  p_attachment_type VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO delivery_notes (
    id, order_id, code, estimated_equipment, status, 
    attachment_path, attachment_type
  )
  VALUES (
    new_id, p_order_id, p_code, p_estimated_equipment, p_status,
    p_attachment_path, p_attachment_type
  );
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create equipment
CREATE OR REPLACE FUNCTION sp_createequipment(
  p_delivery_note_id UUID,
  p_name VARCHAR(200),
  p_serial_number VARCHAR(100),
  p_part_number VARCHAR(100),
  p_device_name VARCHAR(100),
  p_type VARCHAR(100),
  p_model VARCHAR(200),
  p_photo_path VARCHAR(500)
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO equipments (
    id, delivery_note_id, name, serial_number, part_number,
    device_name, type, model, photo_path
  )
  VALUES (
    new_id, p_delivery_note_id, p_name, p_serial_number, p_part_number,
    p_device_name, p_type, p_model, p_photo_path
  );
  
  -- Update DeliveryNote delivered_equipment count
  UPDATE delivery_notes
  SET 
    delivered_equipment = (
      SELECT COUNT(*) 
      FROM equipments 
      WHERE delivery_note_id = p_delivery_note_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_delivery_note_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create estimated equipment
CREATE OR REPLACE FUNCTION sp_createestimatedequipment(
  p_project_id UUID,
  p_type VARCHAR(100),
  p_model VARCHAR(200),
  p_quantity INT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO estimated_equipments (id, project_id, type, model, quantity)
  VALUES (new_id, p_project_id, p_type, p_model, p_quantity);
  
  -- Update Project estimated equipment count
  UPDATE projects
  SET 
    estimated_equipment = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM estimated_equipments
      WHERE project_id = p_project_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_project_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create user
CREATE OR REPLACE FUNCTION sp_createuser(
  p_name VARCHAR(200),
  p_email VARCHAR(255),
  p_password VARCHAR(255),
  p_avatar VARCHAR(500) DEFAULT NULL,
  p_role VARCHAR(50) DEFAULT 'viewer',
  p_department VARCHAR(200) DEFAULT NULL,
  p_location VARCHAR(200) DEFAULT NULL,
  p_user_group_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  p_password_hash VARCHAR(255);
BEGIN
  -- Hash password using pgcrypto
  p_password_hash := crypt(p_password, gen_salt('bf'));
  
  new_id := gen_random_uuid();
  
  INSERT INTO users (
    id, name, email, password_hash, avatar, role, 
    department, location, user_group_id
  )
  VALUES (
    new_id, p_name, p_email, p_password_hash, p_avatar, p_role,
    p_department, p_location, p_user_group_id
  );
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update progress through all levels
CREATE OR REPLACE FUNCTION sp_updateprogress(
  p_delivery_note_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_order_id UUID;
  v_project_id UUID;
BEGIN
  -- Check if delivery note exists
  IF NOT EXISTS (SELECT 1 FROM delivery_notes WHERE id = p_delivery_note_id) THEN
    RAISE EXCEPTION 'DeliveryNote with ID % does not exist', p_delivery_note_id;
  END IF;

  -- Update DeliveryNote delivered equipment count
  UPDATE delivery_notes
  SET 
    delivered_equipment = (
      SELECT COUNT(*) 
      FROM equipments 
      WHERE delivery_note_id = p_delivery_note_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_delivery_note_id;

  -- Update DeliveryNote verified equipment count
  UPDATE delivery_notes
  SET 
    verified_equipment = (
      SELECT COUNT(*) 
      FROM equipments 
      WHERE delivery_note_id = p_delivery_note_id AND is_verified = true
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_delivery_note_id;

  -- Update DeliveryNote progress based on verified vs. estimated
  UPDATE delivery_notes
  SET 
    progress = CASE
      WHEN estimated_equipment = 0 THEN 0  -- Avoid division by zero
      ELSE (
        SELECT CAST(COUNT(*) * 100.0 / NULLIF(estimated_equipment, 0) AS INT)
        FROM equipments 
        WHERE delivery_note_id = p_delivery_note_id AND is_verified = true
      )
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_delivery_note_id;

  -- Get the OrderId from the DeliveryNote
  SELECT order_id INTO v_order_id 
  FROM delivery_notes 
  WHERE id = p_delivery_note_id;

  -- Update Order progress based on DeliveryNotes progress
  IF v_order_id IS NOT NULL THEN
    UPDATE orders
    SET 
      progress = (
        SELECT 
          CASE
            WHEN COUNT(dn.id) = 0 THEN 0  -- Avoid division by zero
            ELSE CAST(AVG(dn.progress) AS INT)
          END
        FROM delivery_notes dn
        WHERE dn.order_id = v_order_id
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = v_order_id;

    -- Get the ProjectId from the Order
    SELECT project_id INTO v_project_id 
    FROM orders 
    WHERE id = v_order_id;

    -- Update Project progress based on Orders progress
    IF v_project_id IS NOT NULL THEN
      UPDATE projects
      SET 
        progress = (
          SELECT 
            CASE
              WHEN COUNT(o.id) = 0 THEN 0  -- Avoid division by zero
              ELSE CAST(AVG(o.progress) AS INT)
            END
          FROM orders o
          WHERE o.project_id = v_project_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = v_project_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get AI provider details
CREATE OR REPLACE FUNCTION sp_getaiproviderdetails(
  p_project_id UUID DEFAULT NULL,
  p_provider_name VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(50),
  api_key VARCHAR(255),
  model VARCHAR(100),
  endpoint VARCHAR(255),
  version VARCHAR(50),
  is_default BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  IF p_project_id IS NOT NULL THEN
    -- Get AI provider from project
    RETURN QUERY
    SELECT ap.*
    FROM ai_providers ap
    JOIN projects p ON p.ai_provider_id = ap.id
    WHERE p.id = p_project_id;
  ELSIF p_provider_name IS NOT NULL THEN
    -- Get AI provider by name
    RETURN QUERY
    SELECT *
    FROM ai_providers
    WHERE name = p_provider_name;
  ELSE
    -- Get default AI provider
    RETURN QUERY
    SELECT *
    FROM ai_providers
    WHERE is_default = true
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic delivery note status updates
CREATE OR REPLACE FUNCTION update_delivery_note_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the status based on the progress and verification
  IF NEW.progress = 100 THEN
    NEW.status := 'Completado';
  ELSIF NEW.verified_equipment > 0 THEN
    NEW.status := 'Validando Recepción';
  ELSIF NEW.delivered_equipment > 0 THEN
    NEW.status := 'Validando Albarán';
  ELSE
    NEW.status := 'Pendiente';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trg_delivery_notes_set_status
BEFORE UPDATE OF progress, verified_equipment, delivered_equipment
ON delivery_notes
FOR EACH ROW
WHEN (OLD.status <> 'Completado') -- Don't change status if already completed
EXECUTE FUNCTION update_delivery_note_status();

-- Insert default AI providers
INSERT INTO ai_providers (id, name, api_key, model, is_default)
VALUES (
  gen_random_uuid(), 
  'MistralAI', 
  'your_mistral_api_key_here', 
  'mistral-large-latest', 
  true
);

INSERT INTO ai_providers (id, name, api_key, model)
VALUES (
  gen_random_uuid(), 
  'OpenAI', 
  'your_openai_api_key_here', 
  'gpt-4-vision-preview'
);

INSERT INTO ai_providers (id, name, api_key, model, endpoint, version)
VALUES (
  gen_random_uuid(), 
  'AzureOpenAI', 
  'your_azure_openai_api_key_here', 
  'gpt-4-vision', 
  'https://your-resource-name.openai.azure.com', 
  '2023-05-15'
);

-- Insert default permissions
INSERT INTO permissions (id, name, description, resource, action) VALUES
  (gen_random_uuid(), 'projects.view', 'Ver proyectos', 'projects', 'read'),
  (gen_random_uuid(), 'projects.edit', 'Editar proyectos', 'projects', 'update'),
  (gen_random_uuid(), 'projects.create', 'Crear proyectos', 'projects', 'create'),
  (gen_random_uuid(), 'incidents.view', 'Ver incidencias', 'incidents', 'read'),
  (gen_random_uuid(), 'incidents.manage', 'Gestionar incidencias', 'incidents', 'manage'),
  (gen_random_uuid(), 'users.manage', 'Gestionar usuarios', 'users', 'manage'),
  (gen_random_uuid(), 'settings.manage', 'Gestionar ajustes', 'settings', 'manage');

-- Insert default user groups
DO $$
DECLARE
  admin_group_id UUID := gen_random_uuid();
  tech_group_id UUID := gen_random_uuid();
  supervisor_group_id UUID := gen_random_uuid();
  viewer_group_id UUID := gen_random_uuid();
BEGIN
  -- Insert groups
  INSERT INTO user_groups (id, name, description) VALUES
    (admin_group_id, 'Administradores', 'Acceso completo al sistema'),
    (tech_group_id, 'Técnicos de Datacenter', 'Gestión de equipos y albaranes'),
    (supervisor_group_id, 'Supervisores', 'Supervisión de proyectos e incidencias'),
    (viewer_group_id, 'Visualizadores', 'Solo lectura');

  -- Assign permissions to admin group
  INSERT INTO user_group_permissions (user_group_id, permission_id)
  SELECT admin_group_id, id FROM permissions;

  -- Assign permissions to tech group
  INSERT INTO user_group_permissions (user_group_id, permission_id)
  SELECT tech_group_id, id FROM permissions 
  WHERE resource != 'users' AND resource != 'settings';

  -- Assign permissions to supervisor group
  INSERT INTO user_group_permissions (user_group_id, permission_id)
  SELECT supervisor_group_id, id FROM permissions 
  WHERE action = 'read' OR name LIKE '%incidents%';

  -- Assign permissions to viewer group
  INSERT INTO user_group_permissions (user_group_id, permission_id)
  SELECT viewer_group_id, id FROM permissions 
  WHERE action = 'read';

  -- Insert default admin user
  INSERT INTO users (id, name, email, password_hash, avatar, role, department, location, user_group_id)
  VALUES (
    gen_random_uuid(),
    'Administrador del Sistema',
    'admin@datacenter.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'admin',
    'IT',
    'Madrid',
    admin_group_id
  );
END $$;