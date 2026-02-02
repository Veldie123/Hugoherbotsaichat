-- Run this in Supabase SQL Editor (https://app.supabase.com/project/pckctmojjrrgzuufsqoo/sql)
-- Creates the activity_log table for cross-platform activity tracking

CREATE TABLE IF NOT EXISTS activity_log (
  id varchar PRIMARY KEY,
  user_id varchar NOT NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id varchar NOT NULL,
  duration_seconds integer,
  score integer,
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activities
CREATE POLICY "Users can read own activities" ON activity_log
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own activities  
CREATE POLICY "Users can insert own activities" ON activity_log
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON activity_log
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log(created_at DESC);
