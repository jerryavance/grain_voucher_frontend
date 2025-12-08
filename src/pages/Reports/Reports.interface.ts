// src/pages/Reports/Reports.interface.ts

export interface IReportExport {
    id: string;
    report_type: string;
    report_type_display: string;
    format: string;
    format_display: string;
    filters: Record<string, any>;
    file_path: string;
    file_size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    status_display: string;
    error_message: string;
    generated_by: IUser;
    hub: IHub | null;
    requested_at: string;
    completed_at: string | null;
    expires_at: string;
    record_count: number;
    is_expired: boolean;
    download_url: string | null;
  }
  
  export interface IReportSchedule {
    id: string;
    name: string;
    report_type: string;
    report_type_display: string;
    format: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    frequency_display: string;
    day_of_week: number | null;
    day_of_month: number | null;
    time_of_day: string;
    filters: Record<string, any>;
    recipients: IUser[];
    is_active: boolean;
    hub: IHub | null;
    created_by: IUser;
    created_at: string;
    updated_at: string;
    last_run: string | null;
    next_run: string | null;
  }
  
  export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: string;
  }
  
  export interface IHub {
    id: string;
    name: string;
    location: string;
  }
  
  export interface IReportExportsResults {
    results: IReportExport[];
    count: number;
  }
  
  export interface IReportSchedulesResults {
    results: IReportSchedule[];
    count: number;
  }
  
  export interface IDashboardStats {
    trades: {
      count: number;
      value: number;
    };
    invoices: {
      count: number;
      overdue_count: number;
    };
    payments: {
      count: number;
      value: number;
    };
    deposits: {
      count: number;
      quantity_kg: number;
    };
    vouchers: {
      active_count: number;
    };
    period: {
      start_date: string;
      end_date: string;
    };
  }
  
  export interface IReportFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
    reportType: string;
  }
  
  export interface IScheduleFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
  }
  
  export type TReportType = 
    | 'supplier'
    | 'trade'
    | 'invoice'
    | 'payment'
    | 'depositor'
    | 'voucher'
    | 'inventory'
    | 'investor';
  
  export type TReportFormat = 'pdf' | 'excel' | 'csv';
  
  export type TFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';