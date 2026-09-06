/// <reference path="../.astro/types.d.ts" />

import type { User } from '@supabase/supabase-js';
import type { Role } from './lib/session';

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
