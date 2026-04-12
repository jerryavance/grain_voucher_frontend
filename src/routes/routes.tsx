// src/routes.tsx
import { Navigate } from "react-router-dom";
import RouteGuard from "../guards/RouteGuard";
import AuthGuard from "../components/authentication/AuthGuard";
import GuestGuard from "../components/authentication/GuestGuard";
import DashboardLayout from "../components/Layouts/DashboardLayout";
import { LoginPortal } from "../pages/Authentication/Login/LoginPortal";
import LazyLoader from "./routes-loader";

// ── Smart redirect: admins land on Sourcing Dashboard, others on general Dashboard ──
const STAFF_ROLES = ["super_admin", "hub_admin", "bdm", "finance"];

const DefaultRedirect = () => {
  // Attempt to read the stored user role — adapt this to your auth context
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      const role = user?.role || user?.user?.role || "";
      if (STAFF_ROLES.includes(role)) {
        return <Navigate to="/admin/sourcing/dashboard" replace />;
      }
      if (role === "farmer") {
        return <Navigate to="/supplier/dashboard" replace />;
      }
      if (role === "investor") {
        return <Navigate to="/invest" replace />;
      }
    }
  } catch {
    // fall through to default
  }
  return <Navigate to="/dashboard" replace />;
};

// ── Smart dashboard redirect: staff → sourcing, others → general ──
const DashboardRedirect = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      const role = user?.role || user?.user?.role || "";
      if (STAFF_ROLES.includes(role)) {
        return <Navigate to="/admin/sourcing/dashboard" replace />;
      }
    }
  } catch { /* fall through */ }
  return <LazyLoader.DashboardSaaS />;
};

const routes = [
  { path: "/", element: <DefaultRedirect /> },
  { path: "/login", element: <GuestGuard><LoginPortal /></GuestGuard> },
  { path: "/register", element: <GuestGuard><LoginPortal /></GuestGuard> },

  // =============== AUTHENTICATED ROUTES ===============
  {
    path: "/",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      // ✅ FIX: Admin users now auto-redirect to sourcing dashboard instead of old dashboard
      { path: "dashboard", element: <DashboardRedirect /> },
      { path: "dashboard/account/:tabId", element: <LazyLoader.AccountView /> },

      // Hub List (public)
      { path: "hub-list", element: <LazyLoader.HubList /> },
      { path: "hub-list/details/:hubId", element: <LazyLoader.HubListDetails /> },

      // Vouchers
      { path: "vouchers", element: <LazyLoader.VoucherGrid /> },
      { path: "voucher-management", element: <LazyLoader.VoucherManagement /> },
    ],
  },

  // =============== SUPPLIER (FARMER) ROUTES ===============
  // 🆕 ADD THIS ENTIRE SECTION
  {
    path: "/supplier",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      { path: "dashboard", element: <LazyLoader.SupplierDashboard /> },
      { path: "orders", element: <LazyLoader.SupplierOrders /> },
      { path: "orders/:id", element: <LazyLoader.SupplierOrderDetails /> },
      { path: "invoices", element: <LazyLoader.SupplierInvoicesView /> },
      { path: "payment-methods", element: <LazyLoader.SupplierPaymentPreferences /> },
      { path: "profile", element: <LazyLoader.SupplierProfile /> },
      // { path: "notifications", element: <LazyLoader.SupplierNotifications /> },
    ],
  },

  // =============== INVESTOR ROUTES ===============
  // 🔄 UPDATE THIS SECTION (add children)
  {
    path: "/invest",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      { path: "", element: <LazyLoader.InvestorDashboard /> },
      { path: "returns", element: <LazyLoader.InvestorReturns /> },
      { path: "transactions", element: <LazyLoader.InvestorTransactions /> },
    ],
  },

  // =============== ADMIN ROUTES ===============
  {
    path: "/admin",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      // Trade Module
      { path: "trade", element: <LazyLoader.Trade /> },
      { path: "trade/dashboard", element: <LazyLoader.TradeDashboard /> },
      { path: "trade/:tradeId", element: <LazyLoader.TradeDetails /> },

      // Accounting Module
      { path: "accounting", element: <LazyLoader.Accounting /> },
      { path: "accounting/invoices", element: <LazyLoader.Invoices /> },
      { path: "accounting/invoices/aging", element: <LazyLoader.InvoiceAgingReport /> },
      { path: "accounting/invoices/details/:id", element: <LazyLoader.InvoiceDetails /> },
      { path: "accounting/payments", element: <LazyLoader.Payments /> },
      { path: "accounting/payments/details/:id", element: <LazyLoader.PaymentDetails /> },
      { path: "accounting/journal-entries", element: <LazyLoader.JournalEntries /> },
      { path: "accounting/journal-entries/details/:id", element: <LazyLoader.JournalEntriesDetails /> },
      { path: "accounting/budgets", element: <LazyLoader.Budgets /> },
      { path: "accounting/budgets/details/:id", element: <LazyLoader.BudgetDetails /> },
      { path: "accounting/ledger-entries", element: <LazyLoader.LedgerEntries /> },

      // Reports
      { path: "reports", element: <RouteGuard requiredPermissions={[]}><LazyLoader.Reports /></RouteGuard> },

      // CRM & Others
      { path: "crm", element: <LazyLoader.CRM /> },
      { path: "grain-types", element: <LazyLoader.GrainType /> },
      { path: "quality-grades", element: <LazyLoader.QualityGrade /> },
      { path: "price-feeds", element: <LazyLoader.PriceFeed /> },
      { path: "investors", element: <LazyLoader.InvestorsAdmin /> },
      { path: "investors/receivables", element: <LazyLoader.InvestorReceivablesAdmin /> },
      { path: "investors/period-returns", element: <LazyLoader.InvestorPeriodReturns /> },
      { path: "pay-roll", element: <LazyLoader.Payroll /> },

      // Deposits & Membership
      { path: "deposit", element: <LazyLoader.Deposit /> },
      { path: "deposit-management", element: <LazyLoader.DepositManangement /> },
      { path: "membership", element: <LazyLoader.Membership /> },

      // Inventories
      { path: "inventories", element: <LazyLoader.Inventories /> },

      // Hubs (admin)
      { path: "hubs", element: <RouteGuard requiredPermissions={[]}><LazyLoader.Hub /></RouteGuard> },

      // Users
      { path: "users", element: <RouteGuard requiredPermissions={[]}><LazyLoader.Users /></RouteGuard> },
    ],
  },

  // =============== SOURCING MODULE (ADMIN) ===============
  {
    path: "/admin/sourcing",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      // Dashboard
      { path: "dashboard", element: <LazyLoader.SourcingDashboard /> },
      
      // Suppliers
      { path: "suppliers", element: <LazyLoader.Suppliers /> },
      { path: "suppliers/:id", element: <LazyLoader.SupplierDetails /> },
      
      // Source Orders (buying from farmers)
      { path: "orders", element: <LazyLoader.SourceOrders /> },
      { path: "orders/:id", element: <LazyLoader.SourceOrderDetails /> },
      
      // Deliveries & Weighbridge
      { path: "deliveries", element: <LazyLoader.DeliveryRecords /> },
      { path: "weighbridge", element: <LazyLoader.WeighbridgeRecords /> },
      
      // Supplier Invoices & Payments
      { path: "invoices", element: <LazyLoader.SupplierInvoices /> },
      { path: "invoices/:id", element: <LazyLoader.SupplierInvoiceDetails /> },
      { path: "payments", element: <LazyLoader.SupplierPayments /> },

      // Investor Funding
      { path: "investor-allocations", element: <LazyLoader.InvestorAllocations /> },
      
      // Stock/Inventory (Sale Lots)
      { path: "sale-lots", element: <LazyLoader.SaleLots /> },

      // ✅ NEW: Buyer Profiles (must come before buyer-orders)
      { path: "buyers", element: <LazyLoader.Buyers /> },
      { path: "buyers/:id", element: <LazyLoader.BuyerDetails /> },
      
      // Buyer Orders (selling to buyers)
      { path: "buyer-orders", element: <LazyLoader.BuyerOrders /> },
      { path: "buyer-orders/:id", element: <LazyLoader.BuyerOrderDetails /> },
      
      // Buyer Invoices & Payments
      { path: "buyer-invoices", element: <LazyLoader.BuyerInvoices /> },
      { path: "buyer-payments", element: <LazyLoader.BuyerPayments /> },
      
      // Trade Settlements & P&L
      { path: "settlements", element: <LazyLoader.TradeSettlements /> },

      // Reports & Analytics
      { path: "reports", element: <LazyLoader.SourcingReports /> },

      // Aggregator Trade Costs
      { path: "aggregator-costs", element: <LazyLoader.AggregatorTradeCosts /> },

      // Rejected Lots
      { path: "rejections", element: <LazyLoader.RejectedLots /> },

      // Proforma Invoices (PFI)
      { path: "proforma-invoices", element: <LazyLoader.ProformaInvoices /> },
      { path: "proforma-invoices/:id", element: <LazyLoader.ProformaInvoiceDetails /> },

      { path: "orders/:id/tree", element: <LazyLoader.TransactionTree /> }, 
      { path: "payments/:id", element: <LazyLoader.SupplierPaymentDetails /> },
      { path: "buyer-invoices/:id", element: <LazyLoader.BuyerInvoiceDetails /> },
      { path: "buyer-payments/:id", element: <LazyLoader.BuyerPaymentDetails /> },
    ],
  },

  // =============== FALLBACK ===============
  { path: "/forbidden", element: <LazyLoader.Error403 /> },
  { path: "*", element: <LazyLoader.Error404 /> },
];

export default routes;