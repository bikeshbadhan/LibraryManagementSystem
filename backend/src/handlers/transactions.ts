import { Env, Transaction } from '../types';
import { errorResponse, successResponse, calculateDueDate, calculateOverdueDays, calculateFine } from '../utils/helpers';

export async function issueBook(request: Request, env: Env, userId: number): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    if (!data.book_id || !data.member_id) {
      return errorResponse('Book ID and Member ID are required');
    }
    
    // Check if book is available
    const book = await env.DB.prepare(
      'SELECT * FROM books WHERE id = ?'
    ).bind(data.book_id).first<any>();
    
    if (!book) {
      return errorResponse('Book not found', 404);
    }
    
    if (book.available_copies <= 0) {
      return errorResponse('Book is not available');
    }
    
    // Check if member exists and is active
    const member = await env.DB.prepare(
      'SELECT * FROM members WHERE id = ?'
    ).bind(data.member_id).first<any>();
    
    if (!member) {
      return errorResponse('Member not found', 404);
    }
    
    if (member.status !== 'active') {
      return errorResponse('Member is not active');
    }
    
    // Get default borrowing days from settings
    let defaultDays = 14;
    if (!data.days) {
      const setting = await env.DB.prepare(
        'SELECT value FROM settings WHERE key = ?'
      ).bind('default_borrowing_days').first<{ value: string }>();
      if (setting) {
        defaultDays = parseInt(setting.value);
      }
    }
    
    const issueDate = new Date().toISOString();
    const dueDate = calculateDueDate(data.days || defaultDays);
    
    // Create transaction
    const result = await env.DB.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status, issued_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.book_id,
      data.member_id,
      issueDate,
      dueDate,
      'issued',
      userId
    ).run();
    
    // Update book availability
    await env.DB.prepare(`
      UPDATE books SET available_copies = available_copies - 1 WHERE id = ?
    `).bind(data.book_id).run();
    
    return successResponse({ id: result.meta.last_row_id }, 'Book issued successfully');
  } catch (error) {
    console.error('Issue book error:', error);
    return errorResponse('Failed to issue book');
  }
}

export async function returnBook(request: Request, env: Env, userId: number, id: string): Promise<Response> {
  try {
    const transaction = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ?'
    ).bind(id).first<Transaction>();
    
    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }
    
    if (transaction.status === 'returned') {
      return errorResponse('Book already returned');
    }
    
    const returnDate = new Date().toISOString();
    const overdueDays = calculateOverdueDays(transaction.due_date);
    
    // Update transaction
    await env.DB.prepare(`
      UPDATE transactions 
      SET return_date = ?, status = ?, returned_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(returnDate, 'returned', userId, id).run();
    
    // Update book availability
    await env.DB.prepare(`
      UPDATE books SET available_copies = available_copies + 1 WHERE id = ?
    `).bind(transaction.book_id).run();
    
    // Create fine if overdue
    if (overdueDays > 0) {
      // Get fine per day from settings
      let finePerDay = 5;
      const setting = await env.DB.prepare(
        'SELECT value FROM settings WHERE key = ?'
      ).bind('fine_per_day').first<{ value: string }>();
      if (setting) {
        finePerDay = parseFloat(setting.value);
      }
      
      const fineAmount = calculateFine(overdueDays, finePerDay);
      await env.DB.prepare(`
        INSERT INTO fines (transaction_id, amount, status)
        VALUES (?, ?, ?)
      `).bind(id, fineAmount, 'pending').run();
      
      return successResponse({ overdueDays, fine: fineAmount }, 'Book returned successfully');
    }
    
    return successResponse({ overdueDays, fine: 0 }, 'Book returned successfully');
  } catch (error) {
    console.error('Return book error:', error);
    return errorResponse('Failed to return book');
  }
}

export async function getTransactions(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const memberId = url.searchParams.get('member_id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, b.title as book_title, b.author as book_author, 
             m.name as member_name, m.email as member_email
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      query += ' AND t.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
    }
    
    if (memberId) {
      query += ' AND t.member_id = ?';
      countQuery += ' AND member_id = ?';
      params.push(memberId);
    }
    
    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    
    const transactions = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();
    
    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ count: number }>();
    
    return successResponse({
      transactions: transactions.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return errorResponse('Failed to fetch transactions');
  }
}

export async function getOverdueTransactions(request: Request, env: Env): Promise<Response> {
  try {
    const transactions = await env.DB.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author,
             m.name as member_name, m.email as member_email
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      WHERE t.status = 'issued' AND t.due_date < datetime('now')
      ORDER BY t.due_date ASC
    `).all();
    
    return successResponse(transactions.results || []);
  } catch (error) {
    console.error('Get overdue transactions error:', error);
    return errorResponse('Failed to fetch overdue transactions');
  }
}
