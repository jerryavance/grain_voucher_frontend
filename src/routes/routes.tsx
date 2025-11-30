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

      // Investor Dashboard
      { path: "invest", element: <LazyLoader.InvestorDashboard /> },
    ],
  },

  // =============== ADMIN ROUTES ===============
  {
    path: "/admin",
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      // Trade Module
      { path: "trade", element: <LazyLoader.Trade /> },
      { path: "trade/dashboard", element: <LazyLoader.TradeDashboard /> },     // NEW
      { path: "trade/:tradeId", element: <LazyLoader.TradeDetails /> },         // Details

      // DO NOT ADD /trade/edit/:id → we use modal instead!

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

  // =============== FALLBACK ===============
  { path: "/forbidden", element: <LazyLoader.Error403 /> },
  { path: "*", element: <LazyLoader.Error404 /> },
];

export default routes;