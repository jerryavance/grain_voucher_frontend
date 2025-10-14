export interface IDeposit {
    id: string;
    farmer: IUser;
    hub: IHub;
    agent?: IUser;
    grain_type_details: IGrainType;
    quality_grade_details: IQualityGrade;
    quantity_kg: string;
    moisture_level: string;
    deposit_date: string;
    validated: boolean;
    grn_number: string;
    notes: string;
    value: string;
  }
  
  export interface IGrainType {
    id: string;
    name: string;
    description: string;
  }
  
  export interface IQualityGrade {
    id: string;
    name: string;
    min_moisture: string;
    max_moisture: string;
    description: string;
  }
  
  export interface IHub {
    id: string;
    name: string;
    location?: string;
    description?: string;
  }
  
  export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
    role: string;
  }
  
  export interface IVoucher {
    id: string;
    deposit: IDeposit;
    holder: IUser;
    issue_date: string;
    entry_price: string;
    current_value: string;
    status: string;
    verification_status: string;
    verification_status_display: string;
    verified_by?: IUser;
    verified_at?: string;
    grn_number: string;
    signature_farmer: string;
    signature_agent: string;
    updated_at: string;
    can_be_traded: boolean;
    can_be_redeemed: boolean;
  }
  
  export interface IRedemption {
    id: string;
    voucher: string;
    voucher_details: IVoucher;
    requester: IUser;
    request_date: string;
    amount: string;
    fee: string;
    net_payout: string;
    status: string;
    payment_method: string;
    notes: string;
  }
  
  export interface ILedgerEntry {
    id: string;
    event_type: string;
    related_object_id: string;
    user?: IUser;
    hub?: IHub;
    timestamp: string;
    description: string;
    amount?: string;
  }
  
  export interface IVouchersResults {
    results: IVoucher[];
    count: number;
  }
  
  export interface IRedemptionsResults {
    results: IRedemption[];
    count: number;
  }
  
  export interface IDepositsResults {
    results: IDeposit[];
    count: number;
  }
  
  export interface ILedgerResults {
    results: ILedgerEntry[];
    count: number;
  }
  
  export type TVoucherTableActions = (voucher: IVoucher) => void;
  export type TRedemptionTableActions = (redemption: IRedemption) => void;
  export type TDepositTableActions = (deposit: IDeposit) => void;
  
  export interface IVoucherDetailsModalProps {
    voucher: IVoucher | null;
    handleClose: () => void;
    onUpdate?: () => void;
  }
  
  export interface IRedemptionDetailsModalProps {
    redemption: IRedemption | null;
    handleClose: () => void;
    onUpdate?: () => void;
  }
  
  export interface IRedemptionFormProps {
    handleClose: () => void;
    voucherId?: string;
    callBack?: () => void;
  }
  
  export interface IPaymentConfirmModalProps {
    redemption: IRedemption | null;
    handleClose: () => void;
    onConfirm: () => void;
  }