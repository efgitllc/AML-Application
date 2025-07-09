export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
} 