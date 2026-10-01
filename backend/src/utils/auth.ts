import { JWTPayload } from '../types';

// Simple JWT implementation for Cloudflare Workers
export async function createToken(payload: JWTPayload, secret: string, expiryHours: number = 24): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  // JWT exp should be in seconds (not milliseconds) since Unix epoch per RFC 7519
  const expirySeconds = Math.floor(Date.now() / 1000) + (expiryHours * 60 * 60);
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: expirySeconds }));
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const expectedSignature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(atob(encodedPayload));
    
    // JWT exp is in seconds, so compare with current time in seconds
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Password hashing for Cloudflare Workers
// Note: In production, consider using a more robust solution like Argon2 or bcrypt
export async function hashPassword(password: string, salt: string = 'library-demo-salt'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
