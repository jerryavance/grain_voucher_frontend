// trade/index.ts - UPDATED exports
// Export all Trade module components and utilities

export { default as Trades } from './Trades';
export { default as TradeForm } from './TradeForm';
export { default as TradeDetails } from './TradeDetails';
export { default as TradeDashboard } from './TradeDashboard';
export { default as TradeCostForm } from './TradeCostForm';
export { default as BrokerageForm } from './BrokerageForm';
export { default as GRNForm } from './GRNForm';
export { default as TradeColumnShape } from './TradeColumnShape';
export { default as TradeStatusUpdateForm } from './TradeStatusUpdateForm';

// NEW EXPORTS for investor financing workflow
export { default as TradeFinancingForm } from './TradeFinancingForm';
export { default as VoucherAllocationForm } from './VoucherAllocationForm';
export { default as PaymentRecordForm } from './PaymentRecordForm';

export { TradeService } from './Trade.service';
export { TradeFormFields, PAYMENT_TERMS_OPTIONS, STATUS_OPTIONS } from './TradeFormFields';
export { 
  TradeFormValidations,
  TradeStatusUpdateValidations,
  TradeApprovalValidations,
  VoucherAllocationValidations,
  PaymentRecordValidations,
  TradeCostValidations,
  BrokerageValidations,
  GRNValidations,
  TradeFinancingValidations,
  TradeLoanValidations,
} from './TradeFormValidations';

export type {
  ITrade,
  ITradesResults,
  ITradeCost,
  IBrokerage,
  IGoodsReceivedNote,
  ITradeFinancing,
  ITradeLoan,
  IInventoryAvailability,
  IAvailableVouchers,
  ICostBreakdown,
  IDashboardStats,
  ITradeFormProps,
  ITradeStatusUpdate,
  ITradeApproval,
  IVoucherAllocation,
  IPaymentRecord,
  IGrainType,
  IQualityGrade,
  IHub,
  IAccount,
  IVoucher,
  IUser,
} from './Trade.interface';