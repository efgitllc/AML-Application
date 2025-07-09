import { api } from './api';
import type {
  Risk,
  RiskControl,
  RiskTreatment,
  RiskAssessment,
  RiskFilter,
  RiskDashboardStats,
} from '../types/risk';

class RiskService {
  private readonly BASE_PATH = '/api/risks';

  // Risks
  async getRisks(filters?: RiskFilter): Promise<Risk[]> {
    const response = await api.get<Risk[]>(this.BASE_PATH, { params: filters });
    return response.data;
  }

  async getRisk(id: string): Promise<Risk> {
    const response = await api.get<Risk>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async createRisk(risk: Partial<Risk>): Promise<Risk> {
    const response = await api.post<Risk>(this.BASE_PATH, risk);
    return response.data;
  }

  async updateRisk(id: string, risk: Partial<Risk>): Promise<Risk> {
    const response = await api.put<Risk>(`${this.BASE_PATH}/${id}`, risk);
    return response.data;
  }

  async deleteRisk(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Controls
  async addControl(riskId: string, control: Partial<RiskControl>): Promise<RiskControl> {
    const response = await api.post<RiskControl>(
      `${this.BASE_PATH}/${riskId}/controls`,
      control
    );
    return response.data;
  }

  async updateControl(
    riskId: string,
    controlId: string,
    control: Partial<RiskControl>
  ): Promise<RiskControl> {
    const response = await api.put<RiskControl>(
      `${this.BASE_PATH}/${riskId}/controls/${controlId}`,
      control
    );
    return response.data;
  }

  async deleteControl(riskId: string, controlId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${riskId}/controls/${controlId}`);
  }

  async testControl(
    riskId: string,
    controlId: string,
    testResult: {
      outcome: 'PASS' | 'FAIL' | 'PARTIAL';
      findings: string;
    }
  ): Promise<RiskControl> {
    const response = await api.post<RiskControl>(
      `${this.BASE_PATH}/${riskId}/controls/${controlId}/test`,
      testResult
    );
    return response.data;
  }

  // Treatments
  async addTreatment(riskId: string, treatment: Partial<RiskTreatment>): Promise<RiskTreatment> {
    const response = await api.post<RiskTreatment>(
      `${this.BASE_PATH}/${riskId}/treatments`,
      treatment
    );
    return response.data;
  }

  async updateTreatment(
    riskId: string,
    treatmentId: string,
    treatment: Partial<RiskTreatment>
  ): Promise<RiskTreatment> {
    const response = await api.put<RiskTreatment>(
      `${this.BASE_PATH}/${riskId}/treatments/${treatmentId}`,
      treatment
    );
    return response.data;
  }

  async deleteTreatment(riskId: string, treatmentId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${riskId}/treatments/${treatmentId}`);
  }

  async updateTreatmentProgress(
    riskId: string,
    treatmentId: string,
    progress: number
  ): Promise<RiskTreatment> {
    const response = await api.put<RiskTreatment>(
      `${this.BASE_PATH}/${riskId}/treatments/${treatmentId}/progress`,
      { progress }
    );
    return response.data;
  }

  // Assessments
  async addAssessment(riskId: string, assessment: Partial<RiskAssessment>): Promise<RiskAssessment> {
    const response = await api.post<RiskAssessment>(
      `${this.BASE_PATH}/${riskId}/assessments`,
      assessment
    );
    return response.data;
  }

  async updateAssessment(
    riskId: string,
    assessmentId: string,
    assessment: Partial<RiskAssessment>
  ): Promise<RiskAssessment> {
    const response = await api.put<RiskAssessment>(
      `${this.BASE_PATH}/${riskId}/assessments/${assessmentId}`,
      assessment
    );
    return response.data;
  }

  async deleteAssessment(riskId: string, assessmentId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${riskId}/assessments/${assessmentId}`);
  }

  // Dashboard
  async getDashboardStats(timeframe?: string): Promise<RiskDashboardStats> {
    const response = await api.get<RiskDashboardStats>(`${this.BASE_PATH}/dashboard`, {
      params: { timeframe },
    });
    return response.data;
  }

  // Reports
  async generateReport(filters: RiskFilter, format: 'PDF' | 'EXCEL'): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`${this.BASE_PATH}/reports`, {
      filters,
      format,
    });
    return response.data;
  }

  // Bulk Operations
  async bulkUpdateStatus(
    riskIds: string[],
    status: Risk['status']
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `${this.BASE_PATH}/bulk/status`,
      { riskIds, status }
    );
    return response.data;
  }

  async bulkAssignOwner(
    riskIds: string[],
    ownerId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `${this.BASE_PATH}/bulk/owner`,
      { riskIds, ownerId }
    );
    return response.data;
  }

  async bulkAddTags(
    riskIds: string[],
    tags: string[]
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `${this.BASE_PATH}/bulk/tags`,
      { riskIds, tags }
    );
    return response.data;
  }

  // Export/Import
  async exportRisks(filters: RiskFilter): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`${this.BASE_PATH}/export`, filters);
    return response.data;
  }

  async importRisks(file: File): Promise<{
    success: boolean;
    message: string;
    imported: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{
      success: boolean;
      message: string;
      imported: number;
      errors: string[];
    }>(`${this.BASE_PATH}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const riskService = new RiskService(); 