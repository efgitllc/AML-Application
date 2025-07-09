import { useState, useEffect, useCallback } from 'react';
import { dubaiService } from '../services/dubai.service';
import type {
  EmiratesIDVerification,
  ShariaCompliance,
  DNFBPCompliance,
  DubaiRegulatory,
  UAERiskAssessment,
  BeneficialOwner,
} from '../types/dubai';

interface UseDubaiRegulatoryReturn {
  // Emirates ID
  verifyEmiratesID: (emiratesId: string, documentImage?: File) => Promise<void>;
  emiratesIDResult: EmiratesIDVerification | null;
  
  // Sharia Compliance
  checkShariaCompliance: (transactionId: string) => Promise<void>;
  shariaCompliance: ShariaCompliance | null;
  
  // DNFBP
  assessDNFBP: (data: Partial<DNFBPCompliance>) => Promise<void>;
  dnfbpCompliance: DNFBPCompliance | null;
  
  // Regulatory Reports
  submitReport: (data: Partial<DubaiRegulatory>) => Promise<void>;
  reports: DubaiRegulatory[];
  
  // Risk Assessment
  performRiskAssessment: (entityId: string, data: Partial<UAERiskAssessment>) => Promise<void>;
  riskAssessment: UAERiskAssessment | null;
  
  // Beneficial Owners
  addBeneficialOwner: (customerId: string, data: Partial<BeneficialOwner>) => Promise<void>;
  beneficialOwners: BeneficialOwner[];
  
  loading: boolean;
  error: string | null;
}

export const useDubaiRegulatory = (): UseDubaiRegulatoryReturn => {
  const [emiratesIDResult, setEmiratesIDResult] = useState<EmiratesIDVerification | null>(null);
  const [shariaCompliance, setShariaCompliance] = useState<ShariaCompliance | null>(null);
  const [dnfbpCompliance, setDnfbpCompliance] = useState<DNFBPCompliance | null>(null);
  const [reports, setReports] = useState<DubaiRegulatory[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<UAERiskAssessment | null>(null);
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmiratesID = async (emiratesId: string, documentImage?: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.verifyEmiratesID(emiratesId, documentImage);
      setEmiratesIDResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Emirates ID verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkShariaCompliance = async (transactionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.checkShariaCompliance(transactionId);
      setShariaCompliance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sharia compliance check failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assessDNFBP = async (data: Partial<DNFBPCompliance>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.assessDNFBPCompliance(data);
      setDnfbpCompliance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DNFBP assessment failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (data: Partial<DubaiRegulatory>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.submitRegulatoryReport(data);
      setReports((prev) => [...prev, result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report submission failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performRiskAssessment = async (entityId: string, data: Partial<UAERiskAssessment>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.performRiskAssessment(entityId, data);
      setRiskAssessment(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Risk assessment failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addBeneficialOwner = async (customerId: string, data: Partial<BeneficialOwner>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dubaiService.addBeneficialOwner(customerId, data);
      setBeneficialOwners((prev) => [...prev, result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add beneficial owner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyEmiratesID,
    emiratesIDResult,
    checkShariaCompliance,
    shariaCompliance,
    assessDNFBP,
    dnfbpCompliance,
    submitReport,
    reports,
    performRiskAssessment,
    riskAssessment,
    addBeneficialOwner,
    beneficialOwners,
    loading,
    error,
  };
}; 