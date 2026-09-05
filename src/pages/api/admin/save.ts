export const prerender = false;

import type { APIRoute } from 'astro';
import { validatePlantilla, ValidationError } from '../../../lib/validate';
import { adminUpsertRow, adminDeleteRow, adminGetRow } from '../../../lib/catalog';
import { triggerDeploy } from '../../../lib/deploy';

function checkOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false; // fetch() siempre manda Origin
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, url }) => {
  if (!checkOrigin(request, url)) return json({ error: 'Origen no permitido' }, 403);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  let row;
  try {
    row = validatePlantilla(input as Record<string, unknown>);
  } catch (err) {
    if (err instanceof ValidationError) return json({ error: 'Datos incompletos', issues: err.issues }, 422);
    throw err;
  }

  try {
    await adminUpsertRow(row);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Error al guardar' }, 500);
  }

  const deploy = await triggerDeploy();
  return json({ ok: true, slug: row.slug, deploy });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!checkOrigin(request, url)) return json({ error: 'Origen no permitido' }, 403);

  let slug = '';
  try {
    slug = String(((await request.json()) as { slug?: string }).slug ?? '');
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  if (!slug || !(await adminGetRow(slug))) return json({ error: 'No existe' }, 404);

  try {
    await adminDeleteRow(slug);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Error al eliminar' }, 500);
  }

  const deploy = await triggerDeploy();
  return json({ ok: true, deploy });
};
