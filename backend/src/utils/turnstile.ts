import { Env } from '../types';

interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteip: string,
  env: Env,
  maxRetries: number = 3
): Promise<TurnstileResponse> {
  const idempotencyKey = crypto.randomUUID();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      formData.append('secret', env.TURNKEY || '');
      formData.append('response', token);
      formData.append('remoteip', remoteip);
      formData.append('idempotency_key', idempotencyKey);

      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json() as TurnstileResponse;

      if (response.ok) {
        return result;
      }

      // If this is the last attempt, return the error
      if (attempt === maxRetries) {
        return result;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, 'error-codes': ['internal-error'] };
      }
      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  return { success: false, 'error-codes': ['internal-error'] };
}
