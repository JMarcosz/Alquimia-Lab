export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, ApiError } from '../../../../lib/api';
import { createAdminClient } from '../../../../lib/supabase';
import { writeAudit } from '../../../../lib/audit';

type NewUser = { email?: unknown; role?: unknown; password?: unknown };

/** Contraseña temporal legible: 4-4-4 con símbolo. */
function tempPassword(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const chunk = () =>
    Array.from({ length: 4 }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
  return `${chunk()}-${chunk()}-${chunk()}#7`;
}

/** GET /api/admin/usuarios — lista de cuentas del panel. */
export const GET: APIRoute = guard(async ({ locals }) => {
  requireRole(locals, 'superadmin');
  const { data, error } = await createAdminClient().auth.admin.listUsers({ perPage: 200 });
  if (error) throw new ApiError(500, { error: error.message });

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: (u.app_metadata as Record<string, unknown>)?.role === 'superadmin' ? 'superadmin' : 'editor',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    disabled: Boolean((u as { banned_until?: string }).banned_until &&
      new Date((u as { banned_until?: string }).banned_until!) > new Date()),
  }));
  return json({ ok: true, users });
});

/** POST /api/admin/usuarios — crea una cuenta. Devuelve la contraseña una vez. */
export const POST: APIRoute = guard(async ({ request, locals }) => {
  const { user } = requireRole(locals, 'superadmin');
  const body = await readJson<NewUser>(request);

  const email = String(body.email ?? '').trim().toLowerCase();
  const role = body.role === 'superadmin' ? 'superadmin' : 'editor';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new ApiError(422, { error: 'Correo inválido' });
  }
  const password = String(body.password ?? '').trim() || tempPassword();
  if (password.length < 8) throw new ApiError(422, { error: 'La contraseña necesita 8+ caracteres' });

  const { data, error } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });
  if (error) throw new ApiError(400, { error: error.message });

  await writeAudit({
    actor: user,
    action: 'user_create',
    entity: 'usuario',
    entityId: data.user.id,
    summary: `Creó la cuenta ${email} (rol ${role})`,
  });

  return json({ ok: true, user: { id: data.user.id, email, role }, password });
});
