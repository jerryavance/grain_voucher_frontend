import { TOption } from "../../@types/common";

export interface IEmployee {
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        role: string;
    };
    contract_start: string;
    salary: string;
    created_at: string;
    updated_at: string;
}

export interface IPayslip {
    id: string;
    employee: IEmployee;
    period: string;
    gross_earnings: string;
    deductions: string;
    net_pay: string;
    created_at: string;
}

export interface IEmployeesResults {
    results: IEmployee[];
    count: number;
}

export interface IPayslipsResults {
    results: IPayslip[];
    count: number;
}

export type TEmployeeTableActions = (employee: IEmployee) => void;
export type TPayslipTableActions = (payslip: IPayslip) => void;

export interface IEmployeeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

export interface IPayslipFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

export interface IPayrollUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
}

export interface IPayrollUsersResults {
    results: IPayrollUser[];
    count: number;
}

export type PayrollViewType = 'employees' | 'payslips';