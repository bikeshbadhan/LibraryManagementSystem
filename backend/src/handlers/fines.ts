import { Env, Fine } from '../types';
import { errorResponse, successResponse } from '../utils/helpers';

export async function getFines(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT f.*, t.book_id, t.member_id, 
             b.title as book_title, m.name as member_name
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.id
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM fines WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      query += ' AND f.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    
    const fines = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();
    
    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ count: number }>();
    
    return successResponse({
      fines: fines.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get fines error:', error);
    return errorResponse('Failed to fetch fines');
  }
}

export async function collectFine(request: Request, env: Env, userId: number, id: string): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    const fine = await env.DB.prepare(
      'SELECT * FROM fines WHERE id = ?'
    ).bind(id).first<Fine>();
    
    if (!fine) {
      return errorResponse('Fine not found', 404);
    }
    
    if (fine.status === 'paid') {
      return errorResponse('Fine already paid');
    }
    
    const amountToPay = parseFloat(data.amount || '0');
    
    if (amountToPay <= 0) {
      return errorResponse('Invalid payment amount');
    }
    const currentRemaining = fine.amount - fine.paid_amount;
    
    if (amountToPay > currentRemaining) {
      return errorResponse(`Payment amount (${amountToPay}) exceeds remaining fine amount (${currentRemaining})`);
    }
   
    const newPaidAmount = fine.paid_amount + amountToPay;
    const remainingAmount = fine.amount - newPaidAmount;
    
    let newStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (remainingAmount <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }
    
    await env.DB.prepare(`
      UPDATE fines 
      SET paid_amount = ?, status = ?, collected_by = ?, 
          collected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newPaidAmount, newStatus, userId, id).run();
    
    return successResponse({ 
      paidAmount: newPaidAmount, 
      remainingAmount: Math.max(0, remainingAmount),
      status: newStatus 
    }, 'Fine payment recorded successfully');
  } catch (error) {
    console.error('Collect fine error:', error);
    return errorResponse('Failed to collect fine');
  }
}
