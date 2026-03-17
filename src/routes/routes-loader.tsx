import { lazy, Suspense as ReactSuspense } from "react";
import LoadingScreen from "../components/LoadingScreen";

const Suspense: any = ReactSuspense;

const Loadable = (Component: any) => (props: any) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

const RouteLazyLoader = {

  Login: Loadable(lazy(() => import("../pages/Authentication/Login/Login"))),
  DashboardSaaS: Loadable(lazy(() => import("../pages/Dashboard/SaaS"))),
  AccountView: Loadable(lazy(() => import("../pages/Account/Common/AccountView"))),

  HubList: Loadable(lazy(() => import("../pages/HubList/HubList"))),

  HubListDetails: Loadable(lazy(() => import("../pages/HubList/HubDetails"))),

  Membership: Loadable(lazy(() => import("../pages/Membership/HubMembership"))),

  Deposit: Loadable(lazy(() => import("../pages/Deposit/Deposit"))),

  DepositManangement: Loadable(lazy(() => import("../pages/DepositManagement/DepositManagement"))),

  VoucherGrid: Loadable(lazy(() => import("../pages/Voucher/VoucherGrid"))),

  VoucherManagement: Loadable(lazy(() => import("../pages/VoucherManagement/VoucherManagement"))),

  QualityGrade: Loadable(lazy(() => import("../pages/QualityGrade/QualityGrade"))),

  Payroll: Loadable(lazy(() => import("../pages/Payroll/Payroll"))),

  Accounting: Loadable(lazy(() => import("../pages/Accounting/Accounting"))),


  // Add these to RouteLazyLoader object
  Invoices: Loadable(lazy(() => import("../pages/Accounting/Invoices/Invoices"))),
  InvoiceDetails: Loadable(lazy(() => import("../pages/Accounting/Invoices/InvoiceDetails"))),
  InvoiceAgingReport: Loadable(lazy(() => import("../pages/Accounting/Invoices/InvoiceAgingReport"))),



  Payments: Loadable(lazy(() => import("../pages/Accounting/Payments/Payments"))),
  PaymentDetails: Loadable(lazy(() => import("../pages/Accounting/Payments/PaymentDetails"))),


  JournalEntries: Loadable(lazy(() => import("../pages/Accounting/JournalEntries/JournalEntries"))),
  JournalEntriesDetails: Loadable(lazy(() => import("../pages/Accounting/JournalEntries/JournalEntryDetails"))),


  Budgets: Loadable(lazy(() => import("../pages/Accounting/Budgets/Budgets"))),
  BudgetDetails: Loadable(lazy(() => import("../pages/Accounting/Budgets/BudgetDetails"))),

  CRM: Loadable(lazy(() => import("../pages/CRM/CRM"))),

  Trade: Loadable(lazy(() => import("../pages/Trade/Trades"))),
  TradeDetails: Loadable(lazy(() => import("../pages/Trade/TradeDetails"))),
  TradeDashboard: Loadable(lazy(() => import("../pages/Trade/TradeDashboard"))),

  GrainType: Loadable(lazy(() => import("../pages/GrainType/GrainType"))),

  PriceFeed: Loadable(lazy(() => import("../pages/PriceFeed/PriceFeed"))),

  Hub: Loadable(lazy(() => import("../pages/Hub/Hub"))),

  Inventories: Loadable(lazy(() => import("../pages/Inventories/Inventories"))),

  LedgerEntries: Loadable(lazy(() => import("../pages/LedgerEntries/LedgerEntries"))),

  Reports: Loadable(lazy(() => import("../pages/Reports/Reports"))),


  // Sourcing Module (Admin Views) - ALREADY EXISTS
  Suppliers: Loadable(lazy(() => import("../pages/Sourcing/Suppliers"))),
  SourcingDashboard: Loadable(lazy(() => import("../pages/Sourcing/SourcingDashboard"))),
  SupplierDetails: Loadable(lazy(() => import("../pages/Sourcing/SupplierDetails"))),
  SourceOrders: Loadable(lazy(() => import("../pages/Sourcing/SourceOrders"))),
  SourceOrderDetails: Loadable(lazy(() => import("../pages/Sourcing/SourceOrderDetails"))),
  TransactionTree: Loadable(lazy(() => import("../pages/Sourcing/TransactionTree"))),
  SupplierInvoices: Loadable(lazy(() => import("../pages/Sourcing/SupplierInvoices"))),
  SupplierInvoicesView: Loadable(lazy(() => import("../pages/Sourcing/SupplierInvoicesView"))),
  SupplierInvoiceDetails: Loadable(lazy(() => import("../pages/Sourcing/SupplierInvoiceDetails"))),
  DeliveryRecords: Loadable(lazy(() => import("../pages/Sourcing/DeliveryRecords"))),
  WeighbridgeRecords: Loadable(lazy(() => import("../pages/Sourcing/WeighbridgeRecords"))),
  SupplierPayments: Loadable(lazy(() => import("../pages/Sourcing/SupplierPayments"))),
  SupplierPaymentDetails: Loadable(lazy(() => import("../pages/Sourcing/SupplierPaymentDetails"))),
  InvestorAllocations: Loadable(lazy(() => import("../pages/Sourcing/InvestorAllocations"))),
  SaleLots: Loadable(lazy(() => import("../pages/Sourcing/SaleLots"))),

  Buyers: Loadable(lazy(() => import("../pages/Sourcing/Buyers"))),
  BuyerDetails: Loadable(lazy(() => import("../pages/Sourcing/BuyerDetails"))),
  BuyerOrders: Loadable(lazy(() => import("../pages/Sourcing/BuyerOrders"))),
  BuyerOrderDetails: Loadable(lazy(() => import("../pages/Sourcing/BuyerOrderDetails"))),
  BuyerInvoices: Loadable(lazy(() => import("../pages/Sourcing/BuyerInvoices"))),
  BuyerInvoiceDetails: Loadable(lazy(() => import("../pages/Sourcing/BuyerInvoiceDetails"))),
  BuyerPayments: Loadable(lazy(() => import("../pages/Sourcing/BuyerPayments"))),
  BuyerPaymentDetails: Loadable(lazy(() => import("../pages/Sourcing/BuyerPaymentDetails"))),
  TradeSettlements: Loadable(lazy(() => import("../pages/Sourcing/TradeSettlements"))),
  AggregatorTradeCosts: Loadable(lazy(() => import("../pages/Sourcing/AggregatorTradeCosts"))),
  RejectedLots: Loadable(lazy(() => import("../pages/Sourcing/RejectedLots"))),

  // 🆕 ADD SUPPLIER PORTAL LOADERS HERE
  SupplierDashboard: Loadable(lazy(() => import("../pages/Sourcing/SupplierDashboard"))),
  SupplierOrders: Loadable(lazy(() => import("../pages/Sourcing/SupplierOrders"))),
  SupplierOrderDetails: Loadable(lazy(() => import("../pages/Sourcing/SupplierOrderDetails"))),
  SupplierPaymentPreferences: Loadable(lazy(() => import("../pages/Sourcing/SupplierPaymentPreferences"))),
  SupplierProfile: Loadable(lazy(() => import("../pages/Sourcing/SupplierProfile"))),

  // Investor Views - ALREADY EXISTS
  InvestorDashboard: Loadable(lazy(() => import("../pages/Investors/InvestorDashboard"))),
  InvestorsAdmin: Loadable(lazy(() => import("../pages/Investors/InvestorsAdmin"))),
  
  // 🆕 ADD INVESTOR PORTAL LOADERS HERE
  InvestorReturns: Loadable(lazy(() => import("../pages/Investors/InvestorReturns"))),
  InvestorTransactions: Loadable(lazy(() => import("../pages/Investors/InvestorTransactions"))),

  // Users - ALREADY EXISTS
  Users: Loadable(lazy(() => import("../pages/Users/Users"))),

  // Error pages - ALREADY EXISTS
  Error404: Loadable(lazy(() => import("../pages/404"))),
  Error403: Loadable(lazy(() => import("../pages/403"))),

};

export default RouteLazyLoader;