/// <reference path="../.astro/types.d.ts" />

import type { User } from '@supabase/supabase-js';
import type { Role } from './lib/session';

interface ImportMetaEnv {
  /** Fecha (YYYY-MM-DD) del mtime del video lofi, inyectada en el build. */
  readonly LOFI_VIDEO_DATE: string;
}

declare global {
  namespace App {
    interface Locals {
      /** Usuario autenticado del panel (Supabase Auth), o `null`. */
      user: User | null;
      /** Rol efectivo: `superadmin` | `editor` | `null` si no hay sesión. */
      role: Role | null;
    }
  }
}

export {};
