export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  JWT_EXPIRY_HOURS?: string;
  TURNKEY?: string;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'staff' | 'student' | 'faculty';
  member_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  member_type: 'student' | 'faculty' | 'public';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  location: string;
  total_copies: number;
  available_copies: number;
  description?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  book_id: number;
  member_id: number;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
  issued_by: number;
  returned_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Fine {
  id: number;
  transaction_id: number;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid';
  collected_by?: number;
  collected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  memberId?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ReportStats {
  totalBooks: number;
  issuedBooks: number;
  overdueBooks: number;
  totalMembers: number;
  totalFinesCollected: number;
  finesPending: number;
}
