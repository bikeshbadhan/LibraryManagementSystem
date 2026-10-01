import { Env, JWTPayload } from '../types';
import { verifyToken } from '../utils/auth';
import { errorResponse } from '../utils/helpers';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export async function authenticate(request: Request, env: Env): Promise<JWTPayload | Response> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Unauthorized: No token provided', 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyToken(token, env.JWT_SECRET);
  
  if (!payload) {
    return errorResponse('Unauthorized: Invalid token', 401);
  }
  
  return payload;
}

export async function requireRole(request: Request, env: Env, allowedRoles: string[]): Promise<JWTPayload | Response> {
  const result = await authenticate(request, env);
  
  if (result instanceof Response) {
    return result;
  }
  
  if (!allowedRoles.includes(result.role)) {
    return errorResponse('Forbidden: Insufficient permissions', 403);
  }
  
  return result;
}
