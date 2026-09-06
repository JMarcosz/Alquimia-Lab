/**
 * Registro de cambios (`public.audit_log`). Cada escritura del panel deja una
 * fila: quién, qué acción, sobre qué producto y el diff de los campos tocados.
 * Se escribe con `service_role` (ignora RLS). La lectura es solo `superadmin`.
 */
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from './supabase';
import { roleOf } from './session';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'show'
  | 'hide'
  | 'reorder'
  | 'login'
  | 'user_create'
  | 'user_disable';

export interface AuditEntry {
  actor: User | null;
  action: AuditAction;
  entity?: string;
  entityId?: string | null;
  summary?: string | null;
  diff?: unknown;
}

/**
 * Inserta una fila de auditoría. Nunca lanza: un fallo al registrar no debe
 * tumbar la operación que el usuario pidió (se traga y se avisa por consola).
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from('audit_log')
      .insert({
        actor_id: entry.actor?.id ?? null,
        actor_email: entry.actor?.email ?? null,
        actor_role: roleOf(entry.actor),
        action: entry.action,
        entity: entry.entity ?? 'plantilla',
        entity_id: entry.entityId ?? null,
        summary: entry.summary ?? null,
        diff: entry.diff ?? null,
      });
    if (error) console.error('[audit] no se registró:', error.message);
  } catch (err) {
    console.error('[audit] no se registró:', err);
  }
}

export interface AuditRow {
  id: number;
  at: string;
  actor_email: string | null;
  actor_role: string | null;
  action: AuditAction;
  entity: string;
  entity_id: string | null;
  summary: string | null;
  diff: unknown;
}

/** Página del registro, más reciente primero. Solo para el panel superadmin. */
export async function readAuditPage(limit = 100, offset = 0): Promise<AuditRow[]> {
  const { data, error } = await createAdminClient()
    .from('audit_log')
    .select('id, at, actor_email, actor_role, action, entity, entity_id, summary, diff')
    .order('at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(`readAuditPage: ${error.message}`);
  return (data ?? []) as AuditRow[];
}

/** Diff compacto: solo las claves cuyo valor cambió, con antes/después. */
export function diffFields<T extends Record<string, unknown>>(
  before: T | null | undefined,
  after: Partial<T>,
): Record<string, { antes: unknown; despues: unknown }> {
  const out: Record<string, { antes: unknown; despues: unknown }> = {};
  for (const key of Object.keys(after)) {
    const a = before?.[key];
    const b = after[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[key] = { antes: a ?? null, despues: b ?? null };
  }
  return out;
}
