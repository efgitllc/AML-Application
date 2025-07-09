import axios from 'axios';
import type { Customer, SearchFilters, ApiResponse, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class CustomerService {
  async getCustomers(filters: SearchFilters): Promise<PaginatedResponse<Customer>> {
    const response = await axios.get(`${API_URL}/customers`, { params: filters });
    return response.data;
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response = await axios.post(`${API_URL}/customers`, data);
    return response.data;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response = await axios.patch(`${API_URL}/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
  }

  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    const response = await axios.get(`${API_URL}/customers/search`, { params: { query } });
    return response.data;
  }
}

export const customerService = new CustomerService(); 