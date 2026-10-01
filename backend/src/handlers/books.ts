import { Env, Book } from '../types';
import { errorResponse, successResponse } from '../utils/helpers';
import { lookupISBN } from '../utils/isbn';

export async function getBooks(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM books';
    let countQuery = 'SELECT COUNT(*) as count FROM books';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?';
      countQuery += ' WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY title LIMIT ? OFFSET ?';
    
    const books = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all<Book>();
    
    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ count: number }>();
    
    return successResponse({
      books: books.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get books error:', error);
    return errorResponse('Failed to fetch books');
  }
}

export async function getBook(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const book = await env.DB.prepare(
      'SELECT * FROM books WHERE id = ?'
    ).bind(id).first<Book>();
    
    if (!book) {
      return errorResponse('Book not found', 404);
    }
    
    return successResponse(book);
  } catch (error) {
    console.error('Get book error:', error);
    return errorResponse('Failed to fetch book');
  }
}

export async function createBook(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    // If ISBN is provided and other fields are missing, try to look up
    if (data.isbn && (!data.title || !data.author)) {
      const isbnData = await lookupISBN(data.isbn);
      if (isbnData) {
        data.title = data.title || isbnData.title;
        data.author = data.author || isbnData.author;
        data.publisher = data.publisher || isbnData.publisher;
        data.publication_year = data.publication_year || isbnData.publication_year;
        data.description = data.description || isbnData.description;
        data.cover_image = data.cover_image || isbnData.cover_image;
      }
    }
    
    if (!data.title || !data.author || !data.location) {
      return errorResponse('Title, author, and location are required');
    }
    
    const totalCopies = data.total_copies || 1;
    
    const result = await env.DB.prepare(`
      INSERT INTO books (isbn, title, author, publisher, publication_year, category, 
        location, total_copies, available_copies, description, cover_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.isbn || null,
      data.title,
      data.author,
      data.publisher || null,
      data.publication_year || null,
      data.category || null,
      data.location,
      totalCopies,
      totalCopies,
      data.description || null,
      data.cover_image || null
    ).run();
    
    return successResponse({ id: result.meta.last_row_id }, 'Book created successfully');
  } catch (error) {
    console.error('Create book error:', error);
    return errorResponse('Failed to create book');
  }
}

export async function updateBook(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    const book = await env.DB.prepare(
      'SELECT * FROM books WHERE id = ?'
    ).bind(id).first<Book>();
    
    if (!book) {
      return errorResponse('Book not found', 404);
    }
    
    await env.DB.prepare(`
      UPDATE books 
      SET isbn = ?, title = ?, author = ?, publisher = ?, publication_year = ?,
          category = ?, location = ?, total_copies = ?, description = ?, 
          cover_image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.isbn || book.isbn,
      data.title || book.title,
      data.author || book.author,
      data.publisher || book.publisher,
      data.publication_year || book.publication_year,
      data.category || book.category,
      data.location || book.location,
      data.total_copies || book.total_copies,
      data.description || book.description,
      data.cover_image || book.cover_image,
      id
    ).run();
    
    return successResponse(null, 'Book updated successfully');
  } catch (error) {
    console.error('Update book error:', error);
    return errorResponse('Failed to update book');
  }
}

export async function deleteBook(request: Request, env: Env, id: string): Promise<Response> {
  try {
    // Check if book has active transactions
    const activeTransactions = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE book_id = ? AND status = ?'
    ).bind(id, 'issued').first<{ count: number }>();
    
    if (activeTransactions && activeTransactions.count > 0) {
      return errorResponse('Cannot delete book with active transactions');
    }
    
    await env.DB.prepare('DELETE FROM books WHERE id = ?').bind(id).run();
    
    return successResponse(null, 'Book deleted successfully');
  } catch (error) {
    console.error('Delete book error:', error);
    return errorResponse('Failed to delete book');
  }
}

export async function lookupISBNHandler(request: Request, env: Env, isbn: string): Promise<Response> {
  try {
    const bookData = await lookupISBN(isbn);
    
    if (!bookData) {
      return errorResponse('Book not found for this ISBN', 404);
    }
    
    return successResponse(bookData);
  } catch (error) {
    console.error('ISBN lookup error:', error);
    return errorResponse('Failed to lookup ISBN');
  }
}

export async function getBookHistory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Check if book exists
    const book = await env.DB.prepare(
      'SELECT * FROM books WHERE id = ?'
    ).bind(id).first<Book>();
    
    if (!book) {
      return errorResponse('Book not found', 404);
    }
    
    // Get all transactions for this book
    const transactions = await env.DB.prepare(`
      SELECT t.*, m.name as member_name, m.email as member_email
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      WHERE t.book_id = ?
      ORDER BY t.issue_date DESC
      LIMIT ? OFFSET ?
    `).bind(id, limit, offset).all();
    
    // Get total count
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE book_id = ?'
    ).bind(id).first<{ count: number }>();
    
    return successResponse({
      transactions: transactions.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Get book history error:', error);
    return errorResponse('Failed to fetch book history');
  }
}
