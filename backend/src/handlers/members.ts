import { Env, Member } from '../types';
import { errorResponse, successResponse } from '../utils/helpers';

export async function getMembers(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM members';
    let countQuery = 'SELECT COUNT(*) as count FROM members';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      countQuery += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    
    const members = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all<Member>();
    
    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ count: number }>();
    
    return successResponse({
      members: members.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get members error:', error);
    return errorResponse('Failed to fetch members');
  }
}

export async function getMember(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const member = await env.DB.prepare(
      'SELECT * FROM members WHERE id = ?'
    ).bind(id).first<Member>();
    
    if (!member) {
      return errorResponse('Member not found', 404);
    }
    
    // Get member's transaction history
    const transactions = await env.DB.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      WHERE t.member_id = ?
      ORDER BY t.created_at DESC
      LIMIT 10
    `).bind(id).all();
    
    // Get outstanding fines
    const fines = await env.DB.prepare(`
      SELECT f.*, t.book_id, b.title as book_title
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.id
      JOIN books b ON t.book_id = b.id
      WHERE t.member_id = ? AND f.status != 'paid'
    `).bind(id).all();
    
    return successResponse({
      member,
      recentTransactions: transactions.results || [],
      outstandingFines: fines.results || []
    });
  } catch (error) {
    console.error('Get member error:', error);
    return errorResponse('Failed to fetch member');
  }
}

export async function createMember(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    if (!data.name || !data.email || !data.member_type) {
      return errorResponse('Name, email, and member type are required');
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO members (name, email, phone, address, member_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.email,
      data.phone || null,
      data.address || null,
      data.member_type,
      data.status || 'active'
    ).run();
    
    return successResponse({ id: result.meta.last_row_id }, 'Member created successfully');
  } catch (error) {
    console.error('Create member error:', error);
    return errorResponse('Failed to create member');
  }
}

export async function updateMember(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    const member = await env.DB.prepare(
      'SELECT * FROM members WHERE id = ?'
    ).bind(id).first<Member>();
    
    if (!member) {
      return errorResponse('Member not found', 404);
    }
    
    await env.DB.prepare(`
      UPDATE members 
      SET name = ?, email = ?, phone = ?, address = ?, member_type = ?, 
          status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.name || member.name,
      data.email || member.email,
      data.phone || member.phone,
      data.address || member.address,
      data.member_type || member.member_type,
      data.status || member.status,
      id
    ).run();
    
    return successResponse(null, 'Member updated successfully');
  } catch (error) {
    console.error('Update member error:', error);
    return errorResponse('Failed to update member');
  }
}

export async function deleteMember(request: Request, env: Env, id: string): Promise<Response> {
  try {
    // Check if member has active transactions
    const activeTransactions = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE member_id = ? AND status = ?'
    ).bind(id, 'issued').first<{ count: number }>();
    
    if (activeTransactions && activeTransactions.count > 0) {
      return errorResponse('Cannot delete member with active transactions');
    }
    
    await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
    
    return successResponse(null, 'Member deleted successfully');
  } catch (error) {
    console.error('Delete member error:', error);
    return errorResponse('Failed to delete member');
  }
}
