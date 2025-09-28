// CRMUtils.ts
import { ILead, IAccount, IContact, IOpportunity, IContract } from "./CRM.interface";

// Status badge color helpers
export const getLeadStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'primary';
    case 'qualified': return 'success';
    case 'lost': return 'error';
    default: return 'default';
  }
};

export const getAccountTypeColor = (type: string) => {
  switch (type) {
    case 'customer': return 'success';
    case 'supplier': return 'warning';
    case 'investor': return 'info';
    default: return 'default';
  }
};

export const getOpportunityStageColor = (stage: string) => {
  switch (stage) {
    case 'prospect': return 'primary';
    case 'quote': return 'warning';
    case 'won': return 'success';
    case 'lost': return 'error';
    default: return 'default';
  }
};

export const getContractStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'primary';
    case 'signed': return 'warning';
    case 'executed': return 'success';
    default: return 'default';
  }
};

// Data transformation helpers
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatVolume = (volume: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(volume) + ' MT';
};

// Calculate opportunity value
export const calculateOpportunityValue = (opportunity: IOpportunity): number => {
  return opportunity.expected_volume_mt * opportunity.expected_price_per_mt;
};

// Get full name from user object
export const getFullName = (user: { first_name: string; last_name: string } | null | undefined): string => {
  if (!user) return 'Unassigned';
  return `${user.first_name} ${user.last_name}`;
};

// Pipeline stage progression helpers
export const getNextLeadStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'new': return 'qualified';
    case 'qualified': return null; // Convert to opportunity
    case 'lost': return null;
    default: return null;
  }
};

export const getNextOpportunityStage = (currentStage: string): string | null => {
  switch (currentStage) {
    case 'prospect': return 'quote';
    case 'quote': return 'won';
    case 'won': return null; // Create contract
    case 'lost': return null;
    default: return null;
  }
};

export const getNextContractStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'draft': return 'signed';
    case 'signed': return 'executed';
    case 'executed': return null;
    default: return null;
  }
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Search and filter helpers
export const filterLeadsByStatus = (leads: ILead[], status: string): ILead[] => {
  return leads.filter(lead => lead.status === status);
};

export const filterAccountsByType = (accounts: IAccount[], type: string): IAccount[] => {
  return accounts.filter(account => account.type === type);
};

export const filterOpportunitiesByStage = (opportunities: IOpportunity[], stage: string): IOpportunity[] => {
  return opportunities.filter(opportunity => opportunity.stage === stage);
};

export const filterContractsByStatus = (contracts: IContract[], status: string): IContract[] => {
  return contracts.filter(contract => contract.status === status);
};

// Summary calculations
export interface ICRMSummary {
  totalLeads: number;
  qualifiedLeads: number;
  totalAccounts: number;
  customerAccounts: number;
  supplierAccounts: number;
  totalOpportunities: number;
  wonOpportunities: number;
  totalOpportunityValue: number;
  averageOpportunityValue: number;
  totalContracts: number;
  executedContracts: number;
  pendingContracts: number;
}

export const calculateCRMSummary = (
  leads: ILead[],
  accounts: IAccount[],
  opportunities: IOpportunity[],
  contracts: IContract[]
): ICRMSummary => {
  const totalLeads = leads.length;
  const qualifiedLeads = filterLeadsByStatus(leads, 'qualified').length;
  
  const totalAccounts = accounts.length;
  const customerAccounts = filterAccountsByType(accounts, 'customer').length;
  const supplierAccounts = filterAccountsByType(accounts, 'supplier').length;
  
  const totalOpportunities = opportunities.length;
  const wonOpportunities = filterOpportunitiesByStage(opportunities, 'won').length;
  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + calculateOpportunityValue(opp), 0);
  const averageOpportunityValue = totalOpportunities > 0 ? totalOpportunityValue / totalOpportunities : 0;
  
  const totalContracts = contracts.length;
  const executedContracts = filterContractsByStatus(contracts, 'executed').length;
  const pendingContracts = contracts.filter(c => c.status === 'draft' || c.status === 'signed').length;

  return {
    totalLeads,
    qualifiedLeads,
    totalAccounts,
    customerAccounts,
    supplierAccounts,
    totalOpportunities,
    wonOpportunities,
    totalOpportunityValue,
    averageOpportunityValue,
    totalContracts,
    executedContracts,
    pendingContracts,
  };
};

// Export helpers
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const csvContent = [
    headers,
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Date helpers specific to CRM
export const isOverdue = (date: string, days: number = 30): boolean => {
  const targetDate = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - targetDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > days;
};

export const getDaysFromCreation = (createdAt: string): number => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Convert lead to account helper
export const convertLeadToAccount = (lead: ILead): Partial<IAccount> => {
  return {
    name: lead.name,
    type: 'customer', // Default to customer
    credit_terms_days: 30, // Default credit terms
  };
};

// Convert opportunity to contract helper
export const convertOpportunityToContract = (opportunity: IOpportunity): Partial<IContract> => {
  return {
    opportunity_id: opportunity.id,
    terms: `Contract for ${opportunity.name} - ${formatVolume(opportunity.expected_volume_mt)} at ${formatCurrency(opportunity.expected_price_per_mt)}/MT`,
    status: 'draft',
  };
};