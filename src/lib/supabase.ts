/**
 * Clientes de Supabase.
 *
 * `supabase`            — clave publicable (anon). Respeta RLS: solo puede leer
 *                          filas `active`. Se usa en el build (getStaticPaths) y
 *                          para lecturas del panel.
 * `createAdminClient()` — clave service_role. BYPASSA RLS. Solo puede llamarse
 *                          desde código de servidor (rutas `/api/admin/*`).
 *                          Nunca debe llegar al navegador.
 *
 * Las variables NO llevan prefijo `PUBLIC_`, así que solo existen en contexto de
 * servidor (build y SSR). El bundle del cliente no las incluye.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.SUPABASE_URL;
const anonKey = import.meta.env.SUPABASE_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan SUPABASE_URL / SUPABASE_KEY. Definilas en `.env.local` (local) y en ' +
      'Vercel → Settings → Environment Variables (deploy).',
  );
}

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let admin: SupabaseClient | null = null;

/** Cliente con service_role. Solo servidor. Lanza si falta la clave. */
export function createAdminClient(): SupabaseClient {
  if (admin) return admin;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Es secreta y solo de servidor ' +
        '(Supabase → Settings → API → service_role).',
    );
  }
  admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
