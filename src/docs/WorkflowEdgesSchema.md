# Workflow Edges Database Table

## Table: workflow_edges

This table stores the connections between form blocks in the workflow, including any conditional logic that determines when users should navigate between blocks. The enhanced schema supports multiple conditional rules per connection with complex logical operations.

| Column Name       | Data Type                | Description                           | Constraints                            |
|-------------------|--------------------------|---------------------------------------|----------------------------------------|
| id                | UUID                     | Primary key for the edge              | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| form_id           | UUID                     | Reference to the form                 | NOT NULL, REFERENCES forms(form_id)     |
| source_block_id   | UUID                     | ID of the source block                | NOT NULL, REFERENCES form_blocks(id)    |
| default_target_id | UUID                     | Default target when no rules match    | NOT NULL, REFERENCES form_blocks(id)    |
| rules             | JSONB                    | Array of complex conditional rules    | DEFAULT '[]'::jsonb                    |
| order_index       | INTEGER                  | Order of the edge in the workflow     | NOT NULL                                |
| created_at        | TIMESTAMP WITH TIME ZONE | Creation timestamp                    | DEFAULT now()                           |
| updated_at        | TIMESTAMP WITH TIME ZONE | Last update timestamp                 | DEFAULT now()                           |

## Indexes

- Primary key on id
- Index on form_id for efficient form-based lookups
- Index on source_block_id
- Index on default_target_id

## Relationships

- Each edge belongs to one form (form_id → forms.form_id)
- Each edge connects from one block to another (source_block_id → form_blocks.id, default_target_id → form_blocks.id)

## Row-Level Security Policies

- Allow form owners and workspace members to manage workflow edges
- Allow public access for reading edges of published forms

## Purpose

The workflow_edges table enables:
- Storing the structure of form navigation flows
- Supporting advanced conditional logic with multiple rules per connection
- Supporting complex AND/OR logic within each rule
- Preserving the exact order and relationships between form blocks
- Rebuilding the entire form workflow when loading forms

## SQL Creation Script

```sql
CREATE TABLE workflow_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(form_id) ON DELETE CASCADE,
  source_block_id UUID NOT NULL REFERENCES form_blocks(id) ON DELETE CASCADE,
  default_target_id UUID NOT NULL REFERENCES form_blocks(id) ON DELETE CASCADE,
  rules JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_workflow_edges_form_id ON workflow_edges(form_id);
CREATE INDEX idx_workflow_edges_source_block ON workflow_edges(source_block_id);
CREATE INDEX idx_workflow_edges_default_target ON workflow_edges(default_target_id);

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

## Rules JSONB Structure

The `rules` column uses the following JSONB structure:

```json
[
  {
    "id": "rule-uuid-1",
    "name": "High Score Rule", 
    "target_block_id": "target-uuid-1",
    "condition_group": {
      "logical_operator": "AND",
      "conditions": [
        {
          "field": "score",
          "operator": "greater_than",
          "value": 80
        },
        {
          "field": "attempts",
          "operator": "less_than",
          "value": 3
        }
      ]
    }
  },
  {
    "id": "rule-uuid-2",
    "name": "Option Selection Rule",
    "target_block_id": "target-uuid-2",
    "condition_group": {
      "logical_operator": "OR",
      "conditions": [
        {
          "field": "selected_option",
          "operator": "equals",
          "value": "option1"
        },
        {
          "field": "selected_option",
          "operator": "equals",
          "value": "option3"
        }
      ]
    }
  }
]
```

This structure allows for multiple independent rules, each with its own target block and complex condition groups. 