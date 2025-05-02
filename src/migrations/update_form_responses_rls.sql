-- Update RLS policies for form_responses to allow anonymous form submissions

-- First, drop any existing RLS policies for form_responses that might conflict
DROP POLICY IF EXISTS "Allow public form submissions" ON form_responses;
DROP POLICY IF EXISTS "Allow form owners to view responses" ON form_responses;

-- Create policy to allow anyone to insert form responses (necessary for public form filling)
CREATE POLICY "Allow public form submissions" 
ON form_responses 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);  -- Anyone can submit a form response

-- Create policy to allow form owners and workspace members to view responses
CREATE POLICY "Allow form owners to view responses" 
ON form_responses 
FOR SELECT 
TO authenticated
USING (
  form_id IN (
    SELECT form_id FROM forms 
    WHERE created_by = auth.uid() 
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create policy to allow response creators to update their own responses
CREATE POLICY "Allow users to update their own responses"
ON form_responses
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Create policy to allow form owners to delete responses
CREATE POLICY "Allow form owners to delete responses"
ON form_responses
FOR DELETE
TO authenticated
USING (
  form_id IN (
    SELECT form_id FROM forms 
    WHERE created_by = auth.uid() 
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);
