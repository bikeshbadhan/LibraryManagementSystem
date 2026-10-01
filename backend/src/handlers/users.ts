import { Env, User } from '../types';
import { hashPassword } from '../utils/auth';
import { errorResponse, successResponse } from '../utils/helpers';

export async function getUsers(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const users = await env.DB.prepare(`
      SELECT u.id, u.username, u.role, u.member_id, u.created_at, u.updated_at,
             m.email as member_email
      FROM users u
      LEFT JOIN members m ON u.member_id = m.id
      ORDER BY u.username 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first<{ count: number }>();
    
    return successResponse({
      users: users.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('Failed to fetch users');
  }
}

export async function createUser(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    if (!data.username || !data.password || !data.role) {
      return errorResponse('Username, password, and role are required');
    }
    
    // Validate role
    const validRoles = ['admin', 'staff', 'student', 'faculty'];
    if (!validRoles.includes(data.role)) {
      return errorResponse('Invalid role');
    }
    
    // If role is student or faculty, member_id is required
    if ((data.role === 'student' || data.role === 'faculty') && !data.member_id) {
      return errorResponse('Member ID is required for student/faculty users');
    }
    
    const passwordHash = await hashPassword(data.password);
    
    const result = await env.DB.prepare(`
      INSERT INTO users (username, password_hash, role, member_id)
      VALUES (?, ?, ?, ?)
    `).bind(
      data.username,
      passwordHash,
      data.role,
      data.member_id || null
    ).run();
    
    return successResponse({ id: result.meta.last_row_id }, 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse('Failed to create user');
  }
}

export async function updateUser(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first<User>();
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    let passwordHash = user.password_hash;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }
    
    await env.DB.prepare(`
      UPDATE users 
      SET username = ?, password_hash = ?, role = ?, member_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.username || user.username,
      passwordHash,
      data.role || user.role,
      data.member_id !== undefined ? data.member_id : user.member_id,
      id
    ).run();
    
    return successResponse(null, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Failed to update user');
  }
}

export async function deleteUser(request: Request, env: Env, id: string): Promise<Response> {
  try {
    // Prevent deleting the last admin
    const adminCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE role = ?'
    ).bind('admin').first<{ count: number }>();
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first<User>();
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    if (user.role === 'admin' && adminCount && adminCount.count <= 1) {
      return errorResponse('Cannot delete the last admin user');
    }
    
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    
    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse('Failed to delete user');
  }
}
