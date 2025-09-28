// Accounting module constants
export const INVOICE_STATUS_OPTIONS = [
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ];
  
  export const ACCOUNT_TYPES = [
    { label: 'Assets', value: 'assets' },
    { label: 'Liabilities', value: 'liabilities' },
    { label: 'Equity', value: 'equity' },
    { label: 'Revenue', value: 'revenue' },
    { label: 'Expenses', value: 'expenses' },
  ];
  
  export const COMMON_ACCOUNTS = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Accounts Receivable', value: 'AR' },
    { label: 'Accounts Payable', value: 'AP' },
    { label: 'Revenue', value: 'REV' },
    { label: 'Cost of Goods Sold', value: 'COGS' },
    { label: 'Operating Expenses', value: 'OPEX' },
    { label: 'Bank Account', value: 'BANK' },
    { label: 'Inventory', value: 'INV' },
  ];
  
  export const BUDGET_PERIODS = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annual', value: 'annual' },
  ];
  
  export const ACCOUNTING_ENDPOINTS = {
    INVOICES: '/api/accounting/invoices/',
    JOURNAL_ENTRIES: '/api/accounting/journal-entries/',
    BUDGETS: '/api/accounting/budgets/',
    INVOICE_AGING: '/api/accounting/invoices/aging/',
  };
  
  // Format currency for display
  export const formatCurrency = (amount: string | number): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numericAmount || 0);
  };
  
  // Format percentage for display
  export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  // Get status color for invoices
  export const getInvoiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'primary';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };