/**
 * Dispara un rebuild de Vercel vía Deploy Hook. Sin la variable configurada
 * (o en `astro dev`) no hace nada y lo informa: el dato ya quedó en Supabase.
 */
export interface DeployResult {
  triggered: boolean;
  reason?: string;
}

export async function triggerDeploy(): Promise<DeployResult> {
  const url = import.meta.env.VERCEL_DEPLOY_HOOK_URL;
  if (import.meta.env.DEV) return { triggered: false, reason: 'modo dev: no se dispara deploy' };
  if (!url) return { triggered: false, reason: 'VERCEL_DEPLOY_HOOK_URL sin configurar' };
  try {
    const r = await fetch(url, { method: 'POST' });
    return r.ok
      ? { triggered: true }
      : { triggered: false, reason: `deploy hook respondió ${r.status}` };
  } catch (err) {
    return { triggered: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
