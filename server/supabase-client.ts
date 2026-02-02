import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pckctmojjrrgzuufsqoo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBja2N0bW9qanJyZ3p1dWZzcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTg1MTUsImV4cCI6MjA4MTY3NDUxNX0.TrPovHz5PgSiwyxVCYplk-SA6cNi0gZkkMVGr3NdIuc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
