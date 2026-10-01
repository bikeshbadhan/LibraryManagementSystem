import { Env } from './types';
import { authenticate, requireRole } from './middleware/auth';
import { errorResponse } from './utils/helpers';
import * as authHandler from './handlers/auth';
import * as booksHandler from './handlers/books';
import * as membersHandler from './handlers/members';
import * as transactionsHandler from './handlers/transactions';
import * as finesHandler from './handlers/fines';
import * as usersHandler from './handlers/users';
import * as reportsHandler from './handlers/reports';
import * as settingsHandler from './handlers/settings';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Public routes
      if (path === '/api/auth/login' && method === 'POST') {
        return await authHandler.login(request, env);
      }

      // Protected routes - require authentication
      const authResult = await authenticate(request, env);
      if (authResult instanceof Response) {
        return authResult;
      }

      // Auth routes
      if (path === '/api/auth/me' && method === 'GET') {
        return await authHandler.me(request, env, authResult);
      }
      
      if (path === '/api/auth/change-password' && method === 'POST') {
        return await authHandler.changePassword(request, env, authResult);
      }

      // Reports (accessible to all authenticated users)
      if (path === '/api/reports' && method === 'GET') {
        return await reportsHandler.getReports(request, env);
      }

      // Settings routes
      if (path === '/api/settings' && method === 'GET') {
        return await settingsHandler.getSettings(request, env);
      }

      if (path === '/api/settings' && method === 'PUT') {
        const roleCheck = await requireRole(request, env, ['admin']);
        if (roleCheck instanceof Response) return roleCheck;
        return await settingsHandler.updateSettings(request, env);
      }

      // Books routes (accessible to all authenticated users for GET)
      if (path === '/api/books' && method === 'GET') {
        return await booksHandler.getBooks(request, env);
      }

      if (path.startsWith('/api/books/isbn/') && method === 'GET') {
        const isbn = path.split('/api/books/isbn/')[1];
        return await booksHandler.lookupISBNHandler(request, env, isbn);
      }

      if (path.match(/^\/api\/books\/\d+\/history$/) && method === 'GET') {
        const id = path.split('/')[3];
        return await booksHandler.getBookHistory(request, env, id);
      }

      if (path.startsWith('/api/books/') && method === 'GET') {
        const id = path.split('/')[3];
        return await booksHandler.getBook(request, env, id);
      }

      // Books CRUD (staff and admin only)
      const adminStaffRoles = ['admin', 'staff'];
      
      if (path === '/api/books' && method === 'POST') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await booksHandler.createBook(request, env);
      }

      if (path.startsWith('/api/books/') && method === 'PUT') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await booksHandler.updateBook(request, env, id);
      }

      if (path.startsWith('/api/books/') && method === 'DELETE') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await booksHandler.deleteBook(request, env, id);
      }

      // Members routes
      if (path === '/api/members' && method === 'GET') {
        // Students/faculty can only view their own member info
        if (authResult.role === 'student' || authResult.role === 'faculty') {
          if (authResult.memberId) {
            return await membersHandler.getMember(request, env, authResult.memberId.toString());
          }
          return errorResponse('Member information not found', 404);
        }
        return await membersHandler.getMembers(request, env);
      }

      if (path.startsWith('/api/members/') && method === 'GET') {
        const id = path.split('/')[3];
        // Students/faculty can only view their own member info
        if ((authResult.role === 'student' || authResult.role === 'faculty') && 
            authResult.memberId?.toString() !== id) {
          return errorResponse('Forbidden', 403);
        }
        return await membersHandler.getMember(request, env, id);
      }

      if (path === '/api/members' && method === 'POST') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await membersHandler.createMember(request, env);
      }

      if (path.startsWith('/api/members/') && method === 'PUT') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await membersHandler.updateMember(request, env, id);
      }

      if (path.startsWith('/api/members/') && method === 'DELETE') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await membersHandler.deleteMember(request, env, id);
      }

      // Transactions routes (staff and admin only)
      if (path === '/api/transactions/issue' && method === 'POST') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await transactionsHandler.issueBook(request, env, authResult.userId);
      }

      if (path.startsWith('/api/transactions/') && path.endsWith('/return') && method === 'POST') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await transactionsHandler.returnBook(request, env, authResult.userId, id);
      }

      if (path === '/api/transactions' && method === 'GET') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await transactionsHandler.getTransactions(request, env);
      }

      if (path === '/api/transactions/overdue' && method === 'GET') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await transactionsHandler.getOverdueTransactions(request, env);
      }

      // Fines routes (staff and admin only)
      if (path === '/api/fines' && method === 'GET') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        return await finesHandler.getFines(request, env);
      }

      if (path.startsWith('/api/fines/') && path.endsWith('/collect') && method === 'POST') {
        const roleCheck = await requireRole(request, env, adminStaffRoles);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await finesHandler.collectFine(request, env, authResult.userId, id);
      }

      // Users routes (admin only)
      if (path === '/api/users' && method === 'GET') {
        const roleCheck = await requireRole(request, env, ['admin']);
        if (roleCheck instanceof Response) return roleCheck;
        return await usersHandler.getUsers(request, env);
      }

      if (path === '/api/users' && method === 'POST') {
        const roleCheck = await requireRole(request, env, ['admin']);
        if (roleCheck instanceof Response) return roleCheck;
        return await usersHandler.createUser(request, env);
      }

      if (path.startsWith('/api/users/') && method === 'PUT') {
        const roleCheck = await requireRole(request, env, ['admin']);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await usersHandler.updateUser(request, env, id);
      }

      if (path.startsWith('/api/users/') && method === 'DELETE') {
        const roleCheck = await requireRole(request, env, ['admin']);
        if (roleCheck instanceof Response) return roleCheck;
        const id = path.split('/')[3];
        return await usersHandler.deleteUser(request, env, id);
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Server error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};
