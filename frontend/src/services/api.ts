import axios, { AxiosInstance } from 'axios';
import type { APIResponse, User, Book, Member, Transaction, Fine, ReportStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username: string, password: string, turnstileToken?: string) {
    const response = await this.api.post<APIResponse<{ token: string; user: User }>>('/auth/login', {
      username,
      password,
      turnstileToken,
    });
    return response.data;
  }

  async me() {
    const response = await this.api.get<APIResponse<User>>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.post<APIResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async getReports() {
    const response = await this.api.get<APIResponse<ReportStats>>('/reports');
    return response.data;
  }

  async getBooks(params?: { search?: string; page?: number; limit?: number }) {
    const response = await this.api.get<APIResponse<{ books: Book[]; total: number; page: number; totalPages: number }>>('/books', { params });
    return response.data;
  }

  async getBook(id: number) {
    const response = await this.api.get<APIResponse<Book>>(`/books/${id}`);
    return response.data;
  }

  async createBook(data: Partial<Book>) {
    const response = await this.api.post<APIResponse<{ id: number }>>('/books', data);
    return response.data;
  }

  async updateBook(id: number, data: Partial<Book>) {
    const response = await this.api.put<APIResponse>(`/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: number) {
    const response = await this.api.delete<APIResponse>(`/books/${id}`);
    return response.data;
  }

  async lookupISBN(isbn: string) {
    const response = await this.api.get<APIResponse<{ title: string; author: string; publisher?: string; publication_year?: number; description?: string }>>(`/books/isbn/${isbn}`);
    return response.data;
  }

  async getMembers(params?: { search?: string; page?: number; limit?: number }) {
    const response = await this.api.get<APIResponse<{ members: Member[]; total: number; page: number; totalPages: number }>>('/members', { params });
    return response.data;
  }

  async getMember(id: number) {
    const response = await this.api.get<APIResponse<{ member: Member; recentTransactions: Transaction[]; outstandingFines: Fine[] }>>(`/members/${id}`);
    return response.data;
  }

  async createMember(data: Partial<Member>) {
    const response = await this.api.post<APIResponse<{ id: number }>>('/members', data);
    return response.data;
  }

  async updateMember(id: number, data: Partial<Member>) {
    const response = await this.api.put<APIResponse>(`/members/${id}`, data);
    return response.data;
  }

  async deleteMember(id: number) {
    const response = await this.api.delete<APIResponse>(`/members/${id}`);
    return response.data;
  }

  async issueBook(bookId: number, memberId: number, days?: number) {
    const response = await this.api.post<APIResponse<{ id: number }>>('/transactions/issue', {
      book_id: bookId,
      member_id: memberId,
      days,
    });
    return response.data;
  }

  async returnBook(transactionId: number) {
    const response = await this.api.post<APIResponse<{ overdueDays: number; fine: number }>>(`/transactions/${transactionId}/return`);
    return response.data;
  }

  async getTransactions(params?: { status?: string; member_id?: number; page?: number; limit?: number }) {
    const response = await this.api.get<APIResponse<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>>('/transactions', { params });
    return response.data;
  }

  async getOverdueTransactions() {
    const response = await this.api.get<APIResponse<Transaction[]>>('/transactions/overdue');
    return response.data;
  }

  async getFines(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.api.get<APIResponse<{ fines: Fine[]; total: number; page: number; totalPages: number }>>('/fines', { params });
    return response.data;
  }

  async collectFine(fineId: number, amount: number) {
    const response = await this.api.post<APIResponse<{ paidAmount: number; remainingAmount: number; status: string }>>(`/fines/${fineId}/collect`, { amount });
    return response.data;
  }

  async getUsers(params?: { page?: number; limit?: number }) {
    const response = await this.api.get<APIResponse<{ users: User[]; total: number; page: number; totalPages: number }>>('/users', { params });
    return response.data;
  }

  async createUser(data: { username: string; password: string; role: string; member_id?: number }) {
    const response = await this.api.post<APIResponse<{ id: number }>>('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: { username?: string; password?: string; role?: string; member_id?: number }) {
    const response = await this.api.put<APIResponse>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.api.delete<APIResponse>(`/users/${id}`);
    return response.data;
  }

  async getSettings() {
    const response = await this.api.get<APIResponse<Record<string, { value: string; description?: string }>>>('/settings');
    return response.data;
  }

  async updateSettings(settings: Record<string, string>) {
    const response = await this.api.put<APIResponse>('/settings', settings);
    return response.data;
  }
}

export const api = new ApiService();
