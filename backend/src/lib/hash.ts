import argon2 from 'argon2';
import crypto from 'crypto';

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

export function randomCode(length = 6) {
  const min = 10 ** (length - 1);
  const max = (10 ** length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
