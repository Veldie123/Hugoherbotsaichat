import { supabase } from '../supabase-client';

async function createSupabaseTables() {
  console.log('Creating v2_sessions table in Supabase...');
  
  const { error: sessionsError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS v2_sessions (
        id VARCHAR NOT NULL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        technique_id VARCHAR NOT NULL,
        mode TEXT NOT NULL,
        current_mode TEXT NOT NULL,
        phase INTEGER NOT NULL DEFAULT 0,
        epic_phase TEXT NOT NULL DEFAULT 'explore',
        epic_milestones JSONB NOT NULL DEFAULT '{"probeUsed": false, "commitReady": false, "impactAsked": false}'::jsonb,
        context JSONB NOT NULL DEFAULT '{}'::jsonb,
        dialogue_state JSONB NOT NULL DEFAULT '{}'::jsonb,
        persona JSONB NOT NULL DEFAULT '{}'::jsonb,
        current_attitude TEXT,
        turn_number INTEGER NOT NULL DEFAULT 0,
        conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
        customer_dynamics JSONB NOT NULL DEFAULT '{}'::jsonb,
        events JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_score INTEGER NOT NULL DEFAULT 0,
        expert_mode INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_v2_sessions_user_id ON v2_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_v2_sessions_is_active ON v2_sessions(is_active);
      CREATE INDEX IF NOT EXISTS idx_v2_sessions_created_at ON v2_sessions(created_at DESC);
    `
  });

  if (sessionsError) {
    console.log('Note: RPC exec_sql may not exist. Creating table via direct insert test...');
    
    const { error: testError } = await supabase
      .from('v2_sessions')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.error('Table v2_sessions does not exist in Supabase.');
      console.log('\n=== MANUAL SQL TO RUN IN SUPABASE DASHBOARD ===\n');
      console.log(`
CREATE TABLE IF NOT EXISTS v2_sessions (
  id VARCHAR NOT NULL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  technique_id VARCHAR NOT NULL,
  mode TEXT NOT NULL,
  current_mode TEXT NOT NULL,
  phase INTEGER NOT NULL DEFAULT 0,
  epic_phase TEXT NOT NULL DEFAULT 'explore',
  epic_milestones JSONB NOT NULL DEFAULT '{"probeUsed": false, "commitReady": false, "impactAsked": false}'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  dialogue_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  persona JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_attitude TEXT,
  turn_number INTEGER NOT NULL DEFAULT 0,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_dynamics JSONB NOT NULL DEFAULT '{}'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_score INTEGER NOT NULL DEFAULT 0,
  expert_mode INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_sessions_user_id ON v2_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_sessions_is_active ON v2_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_v2_sessions_created_at ON v2_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE v2_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access" ON v2_sessions
  FOR ALL USING (true) WITH CHECK (true);
      `);
      return;
    } else if (!testError) {
      console.log('v2_sessions table already exists in Supabase!');
    }
  } else {
    console.log('v2_sessions table created successfully!');
  }

  console.log('\nCreating session_artifacts table in Supabase...');
  
  const { error: artifactsTestError } = await supabase
    .from('session_artifacts')
    .select('id')
    .limit(1);
  
  if (artifactsTestError && artifactsTestError.code === '42P01') {
    console.log('\n=== MANUAL SQL FOR session_artifacts ===\n');
    console.log(`
CREATE TABLE IF NOT EXISTS session_artifacts (
  id VARCHAR NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  session_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  artifact_type TEXT NOT NULL,
  technique_id VARCHAR NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  epic_phase TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_artifacts_session_id ON session_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_session_artifacts_user_id ON session_artifacts(user_id);

-- Enable RLS
ALTER TABLE session_artifacts ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access" ON session_artifacts
  FOR ALL USING (true) WITH CHECK (true);
    `);
  } else if (!artifactsTestError) {
    console.log('session_artifacts table already exists in Supabase!');
  }

  console.log('\nChecking Supabase tables...');
  
  const { data: sessionsCheck } = await supabase
    .from('v2_sessions')
    .select('id')
    .limit(1);
  console.log('v2_sessions accessible:', sessionsCheck !== null);
  
  const { data: artifactsCheck } = await supabase
    .from('session_artifacts')
    .select('id')
    .limit(1);
  console.log('session_artifacts accessible:', artifactsCheck !== null);
}

createSupabaseTables().catch(console.error);
