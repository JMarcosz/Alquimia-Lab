export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, ApiError } from '../../../../../lib/api';
import { createAdminClient } from '../../../../../lib/supabase';
import { writeAudit } from '../../../../../lib/audit';

/** POST /api/admin/usuarios/:id/disable  { disabled: boolean } */
export const POST: APIRoute = guard(async ({ params, request, locals }) => {
  const { user } = requireRole(locals, 'superadmin');
  const id = params.id!;
  if (id === user.id) throw new ApiError(400, { error: 'No puedes desactivar tu propia cuenta' });

  const { disabled } = await readJson<{ disabled?: unknown }>(request);
  if (typeof disabled !== 'boolean') throw new ApiError(400, { error: 'Falta "disabled" (booleano)' });

  const { data, error } = await createAdminClient().auth.admin.updateUserById(id, {
    ban_duration: disabled ? '876000h' : 'none',
  });
  if (error) throw new ApiError(400, { error: error.message });

  await writeAudit({
    actor: user,
    action: 'user_disable',
    entity: 'usuario',
    entityId: id,
    summary: `${disabled ? 'Desactivó' : 'Reactivó'} la cuenta ${data.user.email}`,
  });
  return json({ ok: true, disabled });
});
