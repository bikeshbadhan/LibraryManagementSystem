import { APIResponse } from '../types';

export function jsonResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function successResponse<T>(data: T, message?: string): Response {
  const response: APIResponse<T> = { success: true, data };
  if (message) response.message = message;
  return jsonResponse(response);
}

export function errorResponse(error: string, status: number = 400): Response {
  const response: APIResponse = { success: false, error };
  return jsonResponse(response, status);
}

export function calculateDueDate(days: number = 14): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function calculateOverdueDays(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = now.getTime() - due.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateFine(overdueDays: number, ratePerDay: number = 5): number {
  return overdueDays * ratePerDay;
}

export function calculateDaysBetween(date1: string | Date, date2: string | Date = new Date()): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2.getTime() - d1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
