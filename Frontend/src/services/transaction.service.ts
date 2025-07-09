import axios from 'axios';
import type { Transaction, SearchFilters, ApiResponse, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class TransactionService {
  async getTransactions(filters: SearchFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await axios.get(`${API_URL}/transactions`, { params: filters });
    return response.data;
  }

  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    const response = await axios.get(`${API_URL}/transactions/${id}`);
    return response.data;
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<Transaction>> {
    const response = await axios.patch(`${API_URL}/transactions/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  }

  async flagTransaction(id: string, reason: string): Promise<ApiResponse<Transaction>> {
    const response = await axios.post(`${API_URL}/transactions/${id}/flag`, { reason });
    return response.data;
  }

  async searchTransactions(query: string): Promise<ApiResponse<Transaction[]>> {
    const response = await axios.get(`${API_URL}/transactions/search`, {
      params: { query },
    });
    return response.data;
  }

  async getTransactionHistory(id: string): Promise<ApiResponse<Transaction[]>> {
    const response = await axios.get(`${API_URL}/transactions/${id}/history`);
    return response.data;
  }

  async addTransactionNote(
    id: string,
    note: string
  ): Promise<ApiResponse<{ id: string; note: string; createdAt: string }>> {
    const response = await axios.post(`${API_URL}/transactions/${id}/notes`, { note });
    return response.data;
  }
}

export const transactionService = new TransactionService(); 