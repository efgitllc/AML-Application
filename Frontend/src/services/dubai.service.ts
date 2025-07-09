import { api } from './api';
import type {
  EmiratesIDVerification,
  ShariaCompliance,
  DNFBPCompliance,
  DubaiRegulatory,
  UAERiskAssessment,
  BeneficialOwner
} from '../types/dubai';

class DubaiService {
  private readonly BASE_PATH = '/api/dubai';

  // Emirates ID Verification
  async verifyEmiratesID(emiratesId: string, documentImage?: File): Promise<EmiratesIDVerification> {
    const formData = new FormData();
    formData.append('emiratesId', emiratesId);
    if (documentImage) {
      formData.append('documentImage', documentImage);
    }
    const response = await api.post<EmiratesIDVerification>(`${this.BASE_PATH}/emirates-id/verify`, formData);
    return response.data;
  }

  async getEmiratesIDStatus(verificationId: string): Promise<EmiratesIDVerification> {
    const response = await api.get<EmiratesIDVerification>(`${this.BASE_PATH}/emirates-id/${verificationId}`);
    return response.data;
  }

  // Sharia Compliance
  async checkShariaCompliance(transactionId: string): Promise<ShariaCompliance> {
    const response = await api.post<ShariaCompliance>(`${this.BASE_PATH}/sharia/check/${transactionId}`);
    return response.data;
  }

  async getShariaCompliance(transactionId: string): Promise<ShariaCompliance> {
    const response = await api.get<ShariaCompliance>(`${this.BASE_PATH}/sharia/${transactionId}`);
    return response.data;
  }

  // DNFBP Compliance
  async assessDNFBPCompliance(data: Partial<DNFBPCompliance>): Promise<DNFBPCompliance> {
    const response = await api.post<DNFBPCompliance>(`${this.BASE_PATH}/dnfbp/assess`, data);
    return response.data;
  }

  async getDNFBPCompliance(businessId: string): Promise<DNFBPCompliance> {
    const response = await api.get<DNFBPCompliance>(`${this.BASE_PATH}/dnfbp/${businessId}`);
    return response.data;
  }

  // Dubai Regulatory Reporting
  async submitRegulatoryReport(data: Partial<DubaiRegulatory>): Promise<DubaiRegulatory> {
    const response = await api.post<DubaiRegulatory>(`${this.BASE_PATH}/regulatory/submit`, data);
    return response.data;
  }

  async getRegulatoryReports(filters: Record<string, any>): Promise<DubaiRegulatory[]> {
    const response = await api.get<DubaiRegulatory[]>(`${this.BASE_PATH}/regulatory`, { params: filters });
    return response.data;
  }

  // UAE Risk Assessment
  async performRiskAssessment(entityId: string, data: Partial<UAERiskAssessment>): Promise<UAERiskAssessment> {
    const response = await api.post<UAERiskAssessment>(`${this.BASE_PATH}/risk-assessment/${entityId}`, data);
    return response.data;
  }

  async getRiskAssessment(entityId: string): Promise<UAERiskAssessment> {
    const response = await api.get<UAERiskAssessment>(`${this.BASE_PATH}/risk-assessment/${entityId}`);
    return response.data;
  }

  // Beneficial Owner Management
  async addBeneficialOwner(customerId: string, data: Partial<BeneficialOwner>): Promise<BeneficialOwner> {
    const response = await api.post<BeneficialOwner>(`${this.BASE_PATH}/beneficial-owner/${customerId}`, data);
    return response.data;
  }

  async getBeneficialOwners(customerId: string): Promise<BeneficialOwner[]> {
    const response = await api.get<BeneficialOwner[]>(`${this.BASE_PATH}/beneficial-owner/${customerId}`);
    return response.data;
  }

  async verifyBeneficialOwner(ownerId: string): Promise<BeneficialOwner> {
    const response = await api.post<BeneficialOwner>(`${this.BASE_PATH}/beneficial-owner/verify/${ownerId}`);
    return response.data;
  }
}

export const dubaiService = new DubaiService(); 