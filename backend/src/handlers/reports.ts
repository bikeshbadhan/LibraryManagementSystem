import { Env, ReportStats } from '../types';
import { errorResponse, successResponse } from '../utils/helpers';

export async function getReports(request: Request, env: Env): Promise<Response> {
  try {
    // Get total books
    const totalBooksResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM books'
    ).first<{ count: number }>();
    
    // Get issued books
    const issuedBooksResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE status = ?'
    ).bind('issued').first<{ count: number }>();
    
    // Get overdue books
    const overdueBooksResult = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM transactions WHERE status = 'issued' AND due_date < datetime('now')"
    ).first<{ count: number }>();
    
    // Get total members
    const totalMembersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM members'
    ).first<{ count: number }>();
    
    // Get total fines collected
    const totalFinesCollectedResult = await env.DB.prepare(
      'SELECT COALESCE(SUM(paid_amount), 0) as total FROM fines'
    ).first<{ total: number }>();
    
    // Get fines pending
    const finesPendingResult = await env.DB.prepare(
      'SELECT COALESCE(SUM(amount - paid_amount), 0) as total FROM fines WHERE status != ?'
    ).bind('paid').first<{ total: number }>();
    
    const stats: ReportStats = {
      totalBooks: totalBooksResult?.count || 0,
      issuedBooks: issuedBooksResult?.count || 0,
      overdueBooks: overdueBooksResult?.count || 0,
      totalMembers: totalMembersResult?.count || 0,
      totalFinesCollected: totalFinesCollectedResult?.total || 0,
      finesPending: finesPendingResult?.total || 0
    };
    
    return successResponse(stats);
  } catch (error) {
    console.error('Get reports error:', error);
    return errorResponse('Failed to fetch reports');
  }
}
