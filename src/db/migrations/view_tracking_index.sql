-- Add a more robust deduplication mechanism to form_views table
-- Creates a unique index on form_id, visitor_id with a time-based partition
-- This will prevent duplicate views being recorded within a certain time window

-- First, make sure the timestamp column exists and has the right type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'form_views' AND column_name = 'timestamp'
    ) THEN
        RAISE NOTICE 'Adding timestamp column to form_views table';
        ALTER TABLE form_views ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create a function to get the timestamp truncated to 30-minute intervals
-- This effectively creates 30-minute "buckets" for deduplication
CREATE OR REPLACE FUNCTION trunc_to_30min(ts TIMESTAMPTZ) 
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN date_trunc('hour', ts) + 
         INTERVAL '30 min' * FLOOR(EXTRACT(minute FROM ts) / 30);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a unique index that prevents multiple views from the same visitor
-- for the same form within a 30-minute window
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'form_views_dedup_idx'
    ) THEN
        RAISE NOTICE 'Creating deduplication index on form_views table';
        CREATE UNIQUE INDEX form_views_dedup_idx ON form_views (
            form_id, 
            visitor_id, 
            trunc_to_30min(timestamp)
        );
    END IF;
END $$;
