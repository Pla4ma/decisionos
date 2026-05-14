export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'draft' | 'analyzing' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}
