# Workflow Edges Database Table

## Table: workflow_edges

This table stores the connections between form blocks in the workflow, including any conditional logic that determines when users should navigate between blocks.

| Column Name       | Data Type                | Description                           | Constraints                            |
|-------------------|--------------------------|---------------------------------------|----------------------------------------|
| id                | UUID                     | Primary key for the edge              | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| form_id           | UUID                     | Reference to the form                 | NOT NULL, REFERENCES forms(form_id)     |
| source_block_id   | UUID                     | ID of the source block                | NOT NULL, REFERENCES form_blocks(id)    |
| target_block_id   | UUID                     | ID of the target block                | NOT NULL, REFERENCES form_blocks(id)    |
| condition_field   | TEXT                     | Field name for the condition          | NULL allowed for unconditional edges    |
| condition_operator| TEXT                     | Operator for the condition            | CHECK IN ('equals', 'not_equals', 'contains', 'greater_than', 'less_than') |
| condition_value   | JSONB                    | Value for the condition comparison    | Supports various data types             |
| order_index       | INTEGER                  | Order of the edge in the workflow     | NOT NULL                                |
| created_at        | TIMESTAMP WITH TIME ZONE | Creation timestamp                    | DEFAULT now()                           |
| updated_at        | TIMESTAMP WITH TIME ZONE | Last update timestamp                 | DEFAULT now()                           |

## Indexes

- Primary key on id
- Index on form_id for efficient form-based lookups
- Index on source_block_id
- Index on target_block_id
- Unique index on (form_id, source_block_id, target_block_id, COALESCE(condition_field, ''))

## Relationships

- Each edge belongs to one form (form_id → forms.form_id)
- Each edge connects from one block to another (source_block_id → form_blocks.id, target_block_id → form_blocks.id)

## Row-Level Security Policies

- Allow form owners and workspace members to manage workflow edges
- Allow public access for reading edges of published forms

## Purpose

The workflow_edges table enables:
- Storing the structure of form navigation flows
- Supporting conditional logic based on user responses
- Preserving the exact order and relationships between form blocks
- Rebuilding the entire form workflow when loading forms

## SQL Creation Script

```sql
CREATE TABLE workflow_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(form_id) ON DELETE CASCADE,
  source_block_id UUID NOT NULL REFERENCES form_blocks(id) ON DELETE CASCADE,
  target_block_id UUID NOT NULL REFERENCES form_blocks(id) ON DELETE CASCADE,
  condition_field TEXT,
  condition_operator TEXT CHECK (condition_operator IN ('equals', 'not_equals', 'contains', 'greater_than', 'less_than')),
  condition_value JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_workflow_edges_form_id ON workflow_edges(form_id);
CREATE INDEX idx_workflow_edges_source_block ON workflow_edges(source_block_id);
CREATE INDEX idx_workflow_edges_target_block ON workflow_edges(target_block_id);

-- Unique constraint to prevent duplicate edges between the same blocks with the same condition field
CREATE UNIQUE INDEX idx_unique_workflow_edge ON workflow_edges(form_id, source_block_id, target_block_id, COALESCE(condition_field, ''));

-- Row-Level Security Policies
ALTER TABLE workflow_edges ENABLE ROW LEVEL SECURITY;

-- Allow form owners and workspace members to manage workflow edges
CREATE POLICY manage_workflow_edges ON workflow_edges FOR ALL
USING (form_id IN (
  SELECT form_id FROM forms 
  WHERE workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
));

-- Allow public access for form submission
CREATE POLICY view_published_form_edges ON workflow_edges FOR SELECT
USING (form_id IN (
  SELECT form_id FROM forms 
  WHERE status = 'published'
));
``` 