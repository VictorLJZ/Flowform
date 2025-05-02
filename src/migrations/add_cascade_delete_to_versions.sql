-- Add CASCADE DELETE to form versioning tables
-- This ensures that when a form is deleted, all its versions are automatically deleted

-- First drop the existing foreign key constraint from form_versions
ALTER TABLE form_versions 
DROP CONSTRAINT IF EXISTS form_versions_form_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE form_versions
ADD CONSTRAINT form_versions_form_id_fkey
FOREIGN KEY (form_id)
REFERENCES forms(form_id)
ON DELETE CASCADE;

-- Do the same for form_block_versions
ALTER TABLE form_block_versions
DROP CONSTRAINT IF EXISTS form_block_versions_form_version_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE form_block_versions
ADD CONSTRAINT form_block_versions_form_version_id_fkey
FOREIGN KEY (form_version_id)
REFERENCES form_versions(id)
ON DELETE CASCADE;

-- Also add cascade delete for the block reference in form_block_versions
ALTER TABLE form_block_versions
DROP CONSTRAINT IF EXISTS form_block_versions_block_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE form_block_versions
ADD CONSTRAINT form_block_versions_block_id_fkey
FOREIGN KEY (block_id)
REFERENCES form_blocks(id)
ON DELETE CASCADE;
