import { createClient } from '@supabase/supabase-js'

// Validación para evitar errores silenciosos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

// Cliente principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)