import { lazy, Suspense as ReactSuspense } from "react";
import LoadingScreen from "../components/LoadingScreen";
import JournalEntries from "../pages/Accounting/JournalEntries/JournalEntries";

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

  InvestorDashboard: Loadable(lazy(() => import("../pages/Investors/InvestorDashboard"))),

  InvestorsAdmin: Loadable(lazy(() => import("../pages/Investors/InvestorsAdmin"))),

  Reports: Loadable(lazy(() => import("../pages/Reports/Reports"))),

  // Transactions: Loadable(lazy(() => import("../pages/Transactions/TransactionsList"))),

  Users: Loadable(lazy(() => import("../pages/Users/Users"))),

  Error404: Loadable(lazy(() => import("../pages/404"))),
  Error403: Loadable(lazy(() => import("../pages/403"))),
};

export default RouteLazyLoader;
