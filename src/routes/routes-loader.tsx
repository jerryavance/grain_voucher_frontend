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
  // AUTHENTICATION ROUTES
  Login: Loadable(lazy(() => import("../pages/Authentication/Login/Login"))),

  // DASHBOARD ROUTES
  DashboardSaaS: Loadable(lazy(() => import("../pages/Dashboard/SaaS"))),

  // USER MANAGEMENT ROUTES
  AccountView: Loadable(lazy(() => import("../pages/Account/Common/AccountView"))),

  InvestmentDashboard: Loadable(
    lazy(() => import("../pages/Investments/InvestmentsList/InvestmentsListDashboard"))
  ),

  // INSTUTION ADMIN ROUTES
  Investment: Loadable(
    lazy(() => import("../pages/Investments/TabInvestments"))
  ),
  InvestmentForm: Loadable(
    lazy(() => import("../pages/Investments/InvestmentForm/InvestmentForm"))
  ),
  InvestmentDetailView: Loadable(
    lazy(
      () =>
        import("../pages/Investments/InvestmentDetails/InvestmentDetailView")
    )
  ),

  // INSTUTION ADMIN ROUTES
  Deposit: Loadable(
    lazy(() => import("../pages/Deposit/Deposit"))
  ),
  DepositForm: Loadable(
    lazy(() => import("../pages/Deposit/DepositForm/DepositForm"))
  ),
  DepositDetailView: Loadable(
    lazy(
      () =>
        import("../pages/Deposit/DepositDetails/DepositDetailView")
    )
  ),
  QualityGrade: Loadable(lazy(() => import("../pages/QualityGrade/QualityGrade"))),

  GrainType: Loadable(lazy(() => import("../pages/GrainType/GrainType"))),

  PriceFeed: Loadable(lazy(() => import("../pages/PriceFeed/PriceFeed"))),

  Hub: Loadable(lazy(() => import("../pages/Hub/Hub"))),

  Institutions: Loadable(lazy(() => import("../pages/Institutions/Institutions"))),

  Transactions: Loadable(lazy(() => import("../pages/Transactions/TransactionsList"))),

  // Users
  Users: Loadable(lazy(() => import("../pages/Users/Users"))),

  // ERROR ROUTES
  Error404: Loadable(lazy(() => import("../pages/404"))),
  Error403: Loadable(lazy(() => import("../pages/403"))),
};

export default RouteLazyLoader;
