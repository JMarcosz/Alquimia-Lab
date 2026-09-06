export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/session';
import { sameOrigin } from '../../../lib/api';
import { writeAudit } from '../../../lib/audit';

export const POST: APIRoute = async ({ request, url, cookies, redirect }) => {
  // En una navegación normal de formulario el navegador manda Origin; si falta
  // (algún cliente viejo) lo dejamos pasar, el login no es destructivo.
  const origin = request.headers.get('origin');
  if (origin && !sameOrigin(request, url)) {
    return new Response('Origen no permitido', { status: 403 });
  }

  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');
  const safeNext = next.startsWith('/admin') ? next : '/admin';

  // Pequeño retardo anti fuerza bruta.
  await new Promise((r) => setTimeout(r, 400));

  if (!email || !password) {
    return redirect(`/admin/login?e=1&next=${encodeURIComponent(safeNext)}`, 302);
  }

  const supabase = createSupabaseServerClient(cookies, request.headers);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return redirect(`/admin/login?e=1&next=${encodeURIComponent(safeNext)}`, 302);
  }

  await writeAudit({ actor: data.user, action: 'login', entity: 'sesion', summary: 'Inicio de sesión' });
  return redirect(safeNext, 302);
};
