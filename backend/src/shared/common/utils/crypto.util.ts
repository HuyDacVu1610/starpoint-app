import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hash(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function compare(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  
  const [salt, hashKey] = storedHash.split(':');
  if (!salt || !hashKey) return false;
  
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(hashKey, 'hex');
  const derivedBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  
  return timingSafeEqual(keyBuffer, derivedBuffer);
}
