import { Navigate } from "react-router-dom";
import RouteGuard from "../guards/RouteGuard";
import AuthGuard from "../components/authentication/AuthGuard";
import GuestGuard from "../components/authentication/GuestGuard";
import DashboardLayout from "../components/Layouts/DashboardLayout";
import { LoginPortal } from "../pages/Authentication/Login/LoginPortal";
import LazyLoader from "./routes-loader";
import { ACCOUNT_PAST_INVESTMENTS, ACCOUNT_PROFILE } from "../api/constants";

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
        path: "investments/details/:investmentId",
        element: <LazyLoader.InvestmentDetailView />,
        requiresAuth: true,
      },
      {
        path: "investments/details/:investmentId/:tabId",
        element: <LazyLoader.InvestmentDetailView />,
        requiresAuth: true,
      },
      {
        path: "loan/details/:loanId",
        element: <LazyLoader.DepositDetailView />,
        requiresAuth: true,
      },
      {
        path: "loan/details/:loanId/:tabId",
        element: <LazyLoader.DepositDetailView />,
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
        path: "investments",
        element: <LazyLoader.InvestmentDashboard />,
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
        path: "investment",
        element: <LazyLoader.Investment />,
        requiresAuth: true,
      },
      {
        path: "investment/create",
        element: <LazyLoader.InvestmentForm />,
        requiresAuth: true,
      },
      {
        path: "investment/details/:investmentId",
        element: <LazyLoader.InvestmentDetailView />,
        requiresAuth: true,
      },
      // DEPOSIT
      {
        path: "deposit",
        element: <LazyLoader.Deposit />,
        requiresAuth: true,
      },
      {
        path: "deposit/create",
        element: <LazyLoader.DepositForm />,
        requiresAuth: true,
      },
      {
        path: "deposit/details/:depositId",
        element: <LazyLoader.DepositDetailView />,
        requiresAuth: true,
      },
      {
        path: "transactions",
        element: <LazyLoader.Transactions />,
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
    path: "institutions",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/institutions",
        element: (
          <RouteGuard requiredPermissions={[]}>
            <LazyLoader.Institutions />
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
