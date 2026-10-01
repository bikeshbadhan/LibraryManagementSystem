import { Env, User } from '../types';
import { comparePassword, createToken } from '../utils/auth';
import { errorResponse, successResponse } from '../utils/helpers';
import { verifyTurnstileToken } from '../utils/turnstile';

export async function login(request: Request, env: Env): Promise<Response> {
  try {
    const { username, password, turnstileToken } = await request.json() as { 
      username: string; 
      password: string;
      turnstileToken?: string;
    };
    
    if (!username || !password) {
      return errorResponse('Username and password are required');
    }

    // Verify Turnstile token if TURNKEY is configured
    if (env.TURNKEY && turnstileToken) {
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For') || 
                       'unknown';
      
      const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP, env);
      
      if (!turnstileResult.success) {
        return errorResponse('Verification failed. Please try again.', 401);
      }
    } else if (env.TURNKEY) {
      // If TURNKEY is configured but no token provided
      return errorResponse('Verification token is required', 400);
    }
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first<User>();
    
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }
    
    const isValid = await comparePassword(password, user.password_hash);
    
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }
    
    // Use configured JWT expiry hours or default to 24 hours
    const expiryHours = env.JWT_EXPIRY_HOURS ? parseInt(env.JWT_EXPIRY_HOURS, 10) : 24;
    
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      memberId: user.member_id
    }, env.JWT_SECRET, expiryHours);
    
    return successResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        memberId: user.member_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed');
  }
}

export async function me(request: Request, env: Env, user: any): Promise<Response> {
  try {
    const userData = await env.DB.prepare(
      'SELECT id, username, role, member_id FROM users WHERE id = ?'
    ).bind(user.userId).first();
    
    if (!userData) {
      return errorResponse('User not found', 404);
    }
    
    return successResponse(userData);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user data');
  }
}

export async function changePassword(request: Request, env: Env, user: any): Promise<Response> {
  try {
    const { currentPassword, newPassword } = await request.json() as { currentPassword: string; newPassword: string };
    
    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required');
    }
    
    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters long');
    }
    
    const userData = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(user.userId).first<User>();
    
    if (!userData) {
      return errorResponse('User not found', 404);
    }
    
    const isValid = await comparePassword(currentPassword, userData.password_hash);
    
    if (!isValid) {
      return errorResponse('Current password is incorrect', 401);
    }
    
    const { hashPassword } = await import('../utils/auth');
    const newPasswordHash = await hashPassword(newPassword);
    
    await env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newPasswordHash, user.userId).run();
    
    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password');
  }
}
