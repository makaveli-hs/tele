'use client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'agent';
}

export interface AuthError {
  message: string;
  code?: string;
}