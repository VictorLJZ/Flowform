-- Migration to make default_target_id nullable in workflow_edges table
ALTER TABLE public.workflow_edges
ALTER COLUMN default_target_id DROP NOT NULL;
