/**
 * Sesión del panel admin: cookie firmada con HMAC-SHA256. Sin librería.
 *
 * La cookie es `<payloadBase64url>.<hmacBase64url>`. El payload lleva un
 * timestamp de expiración; la firma cubre el payload con `SESSION_SECRET`.
 * No guarda nada sensible: solo prueba que alguien pasó la contraseña.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'alq_admin';
const MAX_AGE = 60 * 60 * 12; // 12 h

function secret(): string {
  const s = import.meta.env.SESSION_SECRET;
  if (!s) throw new Error('Falta SESSION_SECRET.');
  return s;
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Valor de cookie para un usuario recién autenticado. */
export function issueSession(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString(
    'base64url',
  );
  return `${payload}.${sign(payload)}`;
}

/** ¿La cookie es válida y no expiró? */
export function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, mac] = value.split('.');
  if (!payload || !mac) return false;
  if (!safeEqual(mac, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

/** Compara la contraseña recibida con `ADMIN_PASSWORD` en tiempo constante. */
export function checkPassword(input: string): boolean {
  const expected = import.meta.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('Falta ADMIN_PASSWORD.');
  return safeEqual(input, expected);
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE;
