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

  QualityGrade: Loadable(lazy(() => import("../pages/QualityGrade/QualityGrade"))),

  GrainType: Loadable(lazy(() => import("../pages/GrainType/GrainType"))),

  PriceFeed: Loadable(lazy(() => import("../pages/PriceFeed/PriceFeed"))),

  Hub: Loadable(lazy(() => import("../pages/Hub/Hub"))),

  Inventories: Loadable(lazy(() => import("../pages/Inventories/Inventories"))),

  LedgerEntries: Loadable(lazy(() => import("../pages/LedgerEntries/LedgerEntries"))),

  // Transactions: Loadable(lazy(() => import("../pages/Transactions/TransactionsList"))),

  Users: Loadable(lazy(() => import("../pages/Users/Users"))),

  Error404: Loadable(lazy(() => import("../pages/404"))),
  Error403: Loadable(lazy(() => import("../pages/403"))),
};

export default RouteLazyLoader;
