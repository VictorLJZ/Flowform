-- Form Versioning Migration
-- This migration adds tables for form versioning to support form modifications after responses have been collected

-- Create the form_versions table to track form versions
CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(form_id) NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(form_id, version_number)
);

-- Create an index on form_id
CREATE INDEX IF NOT EXISTS idx_form_versions_form_id ON form_versions(form_id);

-- Add form_version_id column to form_responses table
ALTER TABLE form_responses ADD COLUMN IF NOT EXISTS form_version_id UUID REFERENCES form_versions(id);

-- Create index on form_version_id
CREATE INDEX IF NOT EXISTS idx_form_responses_version ON form_responses(form_version_id);

-- Create form_block_versions table to track block versions
CREATE TABLE IF NOT EXISTS form_block_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID REFERENCES form_blocks(id) NOT NULL,
  form_version_id UUID REFERENCES form_versions(id) NOT NULL,
  title TEXT,
  description TEXT,
  type TEXT NOT NULL,
  subtype TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  settings JSONB,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_block_versions_form_version ON form_block_versions(form_version_id);
CREATE INDEX IF NOT EXISTS idx_form_block_versions_block ON form_block_versions(block_id);

-- Function to create initial version records for existing forms
CREATE OR REPLACE FUNCTION create_initial_form_versions()
RETURNS VOID AS $$
DECLARE
  form_record RECORD;
  version_id UUID;
BEGIN
  FOR form_record IN SELECT * FROM forms LOOP
    -- Create form version
    INSERT INTO form_versions (form_id, version_number, created_at, created_by)
    VALUES (form_record.form_id, 1, form_record.created_at, form_record.created_by)
    RETURNING id INTO version_id;
    
    -- Create block versions for this form version
    INSERT INTO form_block_versions (
      block_id, 
      form_version_id, 
      title, 
      description, 
      type, 
      subtype, 
      required, 
      order_index, 
      settings
    )
    SELECT 
      id, 
      version_id, 
      title, 
      description, 
      type, 
      subtype, 
      required, 
      order_index, 
      settings
    FROM form_blocks 
    WHERE form_id = form_record.form_id;
    
    -- Update existing responses to reference this version
    UPDATE form_responses 
    SET form_version_id = version_id 
    WHERE form_id = form_record.form_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies for form_versions
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY form_versions_insert_policy 
  ON form_versions 
  FOR INSERT 
  WITH CHECK (form_id IN (
    SELECT forms.form_id FROM forms WHERE forms.created_by = auth.uid()
  ));

CREATE POLICY form_versions_select_policy 
  ON form_versions 
  FOR SELECT 
  USING (form_id IN (
    SELECT forms.form_id FROM forms 
    WHERE forms.status = 'published' 
       OR forms.created_by = auth.uid() 
       OR EXISTS (
          SELECT 1 FROM workspace_members wm 
          JOIN forms f ON f.workspace_id = wm.workspace_id 
          WHERE f.form_id = form_id AND wm.user_id = auth.uid()
       )
  ));

-- Row Level Security Policies for form_block_versions
ALTER TABLE form_block_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY form_block_versions_insert_policy 
  ON form_block_versions 
  FOR INSERT 
  WITH CHECK (form_version_id IN (
    SELECT fv.id FROM form_versions fv 
    JOIN forms f ON f.form_id = fv.form_id 
    WHERE f.created_by = auth.uid()
  ));

CREATE POLICY form_block_versions_select_policy 
  ON form_block_versions 
  FOR SELECT 
  USING (form_version_id IN (
    SELECT fv.id FROM form_versions fv 
    JOIN forms f ON f.form_id = fv.form_id 
    WHERE f.status = 'published' 
       OR f.created_by = auth.uid() 
       OR EXISTS (
          SELECT 1 FROM workspace_members wm 
          WHERE wm.workspace_id = f.workspace_id AND wm.user_id = auth.uid()
       )
  ));

-- Comments explaining the migration
COMMENT ON TABLE form_versions IS 'Stores versioning information for forms to track changes over time';
COMMENT ON TABLE form_block_versions IS 'Stores the state of form blocks at specific versions, enabling historical view of forms';
COMMENT ON COLUMN form_responses.form_version_id IS 'References the specific form version this response was submitted against';

-- Create initial versions for existing forms
-- Uncomment this when ready to apply migration
-- SELECT create_initial_form_versions();
