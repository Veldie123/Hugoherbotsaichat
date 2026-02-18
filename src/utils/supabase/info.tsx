export const projectId = import.meta.env.VITE_SUPABASE_URL
  ? new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]
  : "pckctmojjrrgzuufsqoo"

export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""
