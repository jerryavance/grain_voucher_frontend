// src/routes.tsx
import { Navigate } from "react-router-dom";
import RouteGuard from "../guards/RouteGuard";
import AuthGuard from "../components/authentication/AuthGuard";
import GuestGuard from "../components/authentication/GuestGuard";
import DashboardLayout from "../components/Layouts/DashboardLayout";
import { LoginPortal } from "../pages/Authentication/Login/LoginPortal";
import LazyLoader from "./routes-loader";

const routes = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <GuestGuard><LoginPortal /></GuestGuard> },
  { path: "/register", element: <GuestGuard><LoginPortal /></GuestGuard> },

  // =============== AUTHENTICATED ROUTES ===============
  {
    path: "/",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      // Dashboard
      { path: "dashboard", element: <LazyLoader.DashboardSaaS /> },
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

      // Aggregator Trade Costs
      { path: "aggregator-costs", element: <LazyLoader.AggregatorTradeCosts /> },

      // Rejected Lots
      { path: "rejections", element: <LazyLoader.RejectedLots /> },

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