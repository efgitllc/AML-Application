import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useAuth } from './hooks';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Transactions } from './pages/Transactions';
import { Alerts } from './pages/Alerts';
import { Cases } from './pages/Cases';
import Settings from './pages/settings';
import { Analytics } from './pages/analytics';
import { Reports } from './pages/reports';
import { RegulatoryCompliance } from './pages/regulatory/RegulatoryCompliance';
import { DFSADashboard } from './pages/regulatory/DFSADashboard';
import { UAEReporting } from './pages/regulatory/UAEReporting';
import { DubaiRegulatoryDashboard } from './pages/regulatory/DubaiRegulatoryDashboard';
import { EmiratesIDVerification } from './pages/regulatory/EmiratesIDVerification';
import { ShariaCompliance } from './pages/regulatory/ShariaCompliance';
import { DNFBPCompliance } from './pages/regulatory/DNFBPCompliance';
import { DocumentVerification } from './pages/verification/DocumentVerification';
import { RiskAssessment } from './pages/risk/RiskAssessment';
import { AIAnalytics } from './pages/ai/AIAnalytics';
import { Integration } from './pages/integration/Integration';
import { Training } from './pages/training/Training';
import { Sandbox } from './pages/sandbox/Sandbox';
import { SystemArchitecture } from './pages/admin/SystemArchitecture';
import { RulesEngine } from './pages/rules/RulesEngine';
import { WorkflowAutomation } from './pages/workflow/WorkflowAutomation';
import { DocumentManagement } from './pages/documents/DocumentManagement';
import { TaskScheduling } from './pages/scheduling/TaskScheduling';
import { PolicyManagement } from './pages/compliance/PolicyManagement';
import { OrganizationChart } from './pages/organization/OrganizationChart';
import { DeviceManagement } from './pages/devices/DeviceManagement';
import { AdverseMedia } from './pages/screening/AdverseMedia';
import { BiometricAuth } from './pages/security/BiometricAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="cases" element={<Cases />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Regulatory Routes */}
        <Route path="regulatory">
          <Route index element={<RegulatoryCompliance />} />
          <Route path="dfsa" element={<DFSADashboard />} />
          <Route path="uae" element={<UAEReporting />} />
          <Route path="dubai" element={<DubaiRegulatoryDashboard />} />
          <Route path="emirates-id" element={<EmiratesIDVerification />} />
          <Route path="sharia" element={<ShariaCompliance transactionId="example" />} />
          <Route path="dnfbp" element={<DNFBPCompliance businessId="example" />} />
        </Route>
        
        {/* Verification Routes */}
        <Route path="verification">
          <Route path="documents" element={<DocumentVerification />} />
          <Route path="biometric" element={<BiometricAuth />} />
        </Route>
        
        {/* Risk Routes */}
        <Route path="risk">
          <Route path="assessment" element={<RiskAssessment />} />
        </Route>
        
        {/* AI/ML Routes */}
        <Route path="ai">
          <Route path="analytics" element={<AIAnalytics />} />
        </Route>
        
        {/* Integration Routes */}
        <Route path="integration" element={<Integration />} />
        
        {/* Training Routes */}
        <Route path="training" element={<Training />} />
        
        {/* Sandbox Routes */}
        <Route path="sandbox" element={<Sandbox />} />
        
        {/* Admin Routes */}
        <Route path="admin">
          <Route path="system" element={<SystemArchitecture />} />
          <Route path="rules" element={<RulesEngine />} />
          <Route path="workflow" element={<WorkflowAutomation />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="tasks" element={<TaskScheduling />} />
          <Route path="policy" element={<PolicyManagement />} />
          <Route path="organization" element={<OrganizationChart />} />
          <Route path="devices" element={<DeviceManagement />} />
        </Route>
        
        {/* Screening Routes */}
        <Route path="screening">
          <Route path="adverse-media" element={<AdverseMedia />} />
        </Route>
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes; 