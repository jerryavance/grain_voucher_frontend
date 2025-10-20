import { Navigate } from "react-router-dom";
import RouteGuard from "../guards/RouteGuard";
import AuthGuard from "../components/authentication/AuthGuard";
import GuestGuard from "../components/authentication/GuestGuard";
import DashboardLayout from "../components/Layouts/DashboardLayout";
import { LoginPortal } from "../pages/Authentication/Login/LoginPortal";
import LazyLoader from "./routes-loader";

const routes = [
  {
    path: "/",
    element: <Navigate to="dashboard" />,
  },
  {
    path: "login",
    element: (
      <GuestGuard>
        <LoginPortal />
      </GuestGuard>
    ),
  },
  {
    path: "register",
    element: (
        <GuestGuard>
            <LoginPortal />
        </GuestGuard>
    ),
  },
  {
    path: "",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "hub-list",
        element: <LazyLoader.HubList />,
        requiresAuth: true,
      },
      {
        path: "hub-list/details/:hubId",
        element: <LazyLoader.HubListDetails />,
        requiresAuth: true,
      },
    ],
  },

  {
    path: "dashboard",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <LazyLoader.DashboardSaaS />,
      },
      {
        path: "account/:tabId",
        element: <LazyLoader.AccountView />,
      },
      {
        path: "hub-list",
        element: <LazyLoader.HubList />,
      },
      {
        path: "invest",
        element: <LazyLoader.InvestorDashboard />,
      },
      {
        path: "vouchers",
        element: <LazyLoader.VoucherGrid />,
      },
      {
        path: "voucher-management",
        element: <LazyLoader.VoucherManagement />,
      },
    ],
  },

  {
    path: "forbidden",
    element: <LazyLoader.Error403 />,
  },
  {
    path: "*",
    element: <LazyLoader.Error404 />,
  },
  {
    path: "admin",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "quality-grades",
        element: <LazyLoader.QualityGrade />,
        requiresAuth: true,
      },
      {
        path: "grain-types",
        element: <LazyLoader.GrainType />,
        requiresAuth: true,
      },
      {
        path: "price-feeds",
        element: <LazyLoader.PriceFeed />,
        requiresAuth: true,
      },
      {
        path: "investors",
        element: <LazyLoader.InvestorsAdmin />,
        requiresAuth: true,
      },
      {
        path: "pay-roll",
        element: <LazyLoader.Payroll />,
        requiresAuth: true,
      },
      {
        path: "accounting",
        element: <LazyLoader.Accounting />,
        requiresAuth: true,
      },
      {
        path: "crm",
        element: <LazyLoader.CRM />,
        requiresAuth: true,
      },
      {
        path: "trade",
        element: <LazyLoader.Trade />,
        requiresAuth: true,
      },
      {
        path: "trade/:tradeId",
        element: <LazyLoader.TradeDetails />,
        requiresAuth: true,
      },
      {
        path: "deposit",
        element: <LazyLoader.Deposit />,
        requiresAuth: true,
      },
      {
        path: "deposit-management",
        element: <LazyLoader.DepositManangement />,
        requiresAuth: true,
      },
      // {
      //   path: "transactions",
      //   element: <LazyLoader.Transactions />,
      //   requiresAuth: true,
      // },
      {
        path: "membership",
        element: <LazyLoader.Membership />,
        requiresAuth: true,
      },
      {
        path: "inventories",
        element: <LazyLoader.Inventories />,
        requiresAuth: true,
      },
      {
        path: "ledger-entries",
        element: <LazyLoader.LedgerEntries />,
        requiresAuth: true,
      },
    ],
  },
  {
    path: "hubs",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/hubs",
        element: (
          <RouteGuard requiredPermissions={[]}>
            <LazyLoader.Hub />
          </RouteGuard>
        ),
        requiresAuth: true,
      },
    ],
  },
  {
    path: "account",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "profile",
        element: <LazyLoader.AccountView />,
        requiresAuth: true,
      },
    ],
  },
  {
    path: "users",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/users",
        element: (
          <RouteGuard requiredPermissions={[]}>
            <LazyLoader.Users />
          </RouteGuard>
        ),
        requiresAuth: true,
      },
    ],
  },
];

export default routes;
