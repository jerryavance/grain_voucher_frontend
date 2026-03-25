import Icons from "../../icons/sidebar";

export interface IMenuItem {
  title: string;
  Icon?: any;
  path?: string;
  subMenu?: IMenuItem[];
  permissions?: string[];
  users?: string[];
  visible: boolean;
  isHeader?: boolean;
}

export const MenuList = (
  isSuperUser: boolean,
  CanCreateDeposit: boolean,
  CanViewHubMembers: boolean,
  isHubAdmin: boolean,
  CanMakeTrades: boolean,
  userRole: string = ""
): IMenuItem[] => {
  const isSupplier = userRole === "farmer";
  const isInvestor = userRole === "investor";
  const isStaff = ["super_admin", "hub_admin", "bdm", "finance"].includes(userRole);

  return [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HOME — staff users go to Sourcing Dashboard, others to general dashboard
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Home",
      Icon: Icons.HomeIcon,
      path: isStaff ? "/admin/sourcing/dashboard" : isSupplier ? "/supplier/dashboard" : isInvestor ? "/invest" : "/dashboard",
      visible: true,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MY FARMING (Supplier portal)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "My Farming",
      Icon: Icons.Agriculture,
      visible: isSupplier || isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Dashboard",       Icon: Icons.HomeIcon,         path: "/supplier/dashboard",        visible: isSupplier || isSuperUser },
        { title: "My Orders",       Icon: Icons.ShoppingCartIcon, path: "/supplier/orders",           visible: isSupplier || isSuperUser },
        { title: "Invoices",        Icon: Icons.ReceiptIcon,      path: "/supplier/invoices",         visible: isSupplier || isSuperUser },
        { title: "Payment Methods", Icon: Icons.PaymentsIcon,     path: "/supplier/payment-methods",  visible: isSupplier || isSuperUser },
        { title: "My Profile",      Icon: Icons.PeopleIcon,       path: "/supplier/profile",          visible: isSupplier || isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MY INVESTMENTS (Investor portal)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "My Investments",
      Icon: Icons.AccountBalanceIcon,
      visible: isInvestor || isHubAdmin || isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Dashboard",           Icon: Icons.DashboardCustomizeIcon, path: "/invest",              visible: isInvestor || isHubAdmin || isSuperUser },
        { title: "My Returns",          Icon: Icons.TrendingUpIcon,         path: "/invest/returns",      visible: isInvestor || isHubAdmin || isSuperUser },
        { title: "Transaction History",  Icon: Icons.ReceiptIcon,           path: "/invest/transactions", visible: isInvestor || isHubAdmin || isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SOURCING — PRIMARY MODULE for staff/admin users
    // Reorganised by trade lifecycle:
    //   1. Procurement:  Suppliers → Source Orders → Deliveries → Weighbridge
    //   2. Payables:     Supplier Invoices → Supplier Payments
    //   3. Investment:   Investor Allocations
    //   4. Inventory:    Stock (Sale Lots) → Rejected Lots → Aggregator Costs
    //   5. Sales:        Buyers → Buyer Orders → Buyer Invoices → Buyer Payments
    //   6. Settlements:  Settlements & P&L
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Sourcing",
      Icon: Icons.LocalShippingIcon,
      visible: isStaff || isHubAdmin || isSuperUser,
      isHeader: true,
      subMenu: [
        // ── Overview ──────────────────────────────────────────────────────
        {
          title: "Dashboard",
          Icon: Icons.HomeIcon,
          path: "/admin/sourcing/dashboard",
          visible: isSuperUser || isHubAdmin,
        },

        // ── 1. Procurement (Buy Side) ────────────────────────────────────
        {
          title: "Procurement",
          Icon: Icons.ShoppingCartIcon,
          visible: isStaff || isHubAdmin || isSuperUser,
          isHeader: true,
          subMenu: [
            {
              title: "Suppliers",
              Icon: Icons.PeopleIcon,
              path: "/admin/sourcing/suppliers",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Source Orders",
              Icon: Icons.ShoppingCartIcon,
              path: "/admin/sourcing/orders",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Deliveries",
              Icon: Icons.LocalShippingIcon,
              path: "/admin/sourcing/deliveries",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Weighbridge",
              Icon: Icons.BalanceIcon,
              path: "/admin/sourcing/weighbridge",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
          ],
        },

        // ── 2. Payables (Pay the Supplier) ───────────────────────────────
        {
          title: "Payables",
          Icon: Icons.PaymentsIcon,
          visible: isStaff || isHubAdmin || isSuperUser,
          isHeader: true,
          subMenu: [
            {
              title: "Supplier Invoices",
              Icon: Icons.ReceiptIcon,
              path: "/admin/sourcing/invoices",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Supplier Payments",
              Icon: Icons.PaymentsIcon,
              path: "/admin/sourcing/payments",
              visible: isSuperUser,
            },
            {
              title: "Investor Allocations",
              Icon: Icons.AccountBalanceIcon,
              path: "/admin/sourcing/investor-allocations",
              visible: isSuperUser,
            },
          ],
        },

        // ── 3. Inventory (What we hold) ──────────────────────────────────
        {
          title: "Inventory",
          Icon: Icons.InventoryIcon,
          visible: isStaff || isHubAdmin || isSuperUser,
          isHeader: true,
          subMenu: [
            {
              title: "Stock (Sale Lots)",
              Icon: Icons.InventoryIcon,
              path: "/admin/sourcing/sale-lots",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Rejected Lots",
              Icon: Icons.GradeIcon,
              path: "/admin/sourcing/rejections",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Aggregator Costs",
              Icon: Icons.AddBusinessIcon,
              path: "/admin/sourcing/aggregator-costs",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
          ],
        },

        // ── 4. Sales (Sell Side) ─────────────────────────────────────────
        {
          title: "Sales",
          Icon: Icons.AddBusinessIcon,
          visible: isStaff || isHubAdmin || isSuperUser,
          isHeader: true,
          subMenu: [
            {
              title: "Buyers",
              Icon: Icons.AddBusinessIcon,
              path: "/admin/sourcing/buyers",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Buyer Orders",
              Icon: Icons.ShoppingCartIcon,
              path: "/admin/sourcing/buyer-orders",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Buyer Invoices",
              Icon: Icons.ReceiptIcon,
              path: "/admin/sourcing/buyer-invoices",
              visible: isStaff || isHubAdmin || isSuperUser,
            },
            {
              title: "Buyer Payments",
              Icon: Icons.PaymentsIcon,
              path: "/admin/sourcing/buyer-payments",
              visible: isSuperUser,
            },
          ],
        },

        // ── 5. Settlements (Close the Loop) ──────────────────────────────
        {
          title: "Settlements",
          Icon: Icons.TrendingUpIcon,
          visible: isSuperUser,
          isHeader: true,
          subMenu: [
            {
              title: "Settlements & P&L",
              Icon: Icons.TrendingUpIcon,
              path: "/admin/sourcing/settlements",
              visible: isSuperUser,
            },
          ],
        },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // REPORTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Reports",
      Icon: Icons.AssessmentIcon,
      visible: isSuperUser || isHubAdmin,
      isHeader: true,
      subMenu: [
        { title: "Reports & Analytics", Icon: Icons.AssessmentIcon, path: "/admin/reports", visible: isSuperUser || isHubAdmin },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VOUCHERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Vouchers",
      Icon: Icons.ReceiptIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        { title: "My Vouchers",  Icon: Icons.ReceiptIcon,            path: "/vouchers",            visible: true },
        { title: "Redemptions",  Icon: Icons.ConfirmationNumberIcon, path: "/voucher-management",  visible: isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INVEST (Admin)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Invest",
      Icon: Icons.DashboardCustomizeIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Investor Portal",      Icon: Icons.DashboardCustomizeIcon, path: "/invest",                        visible: isSuperUser },
        { title: "Investors Admin",      Icon: Icons.FolderSharedIcon,       path: "/admin/investors",               visible: isSuperUser },
        { title: "Investor Receivables", Icon: Icons.TrendingUpIcon,         path: "/admin/investors/receivables",   visible: isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HUBS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Hubs",
      Icon: Icons.FactoryIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        { title: "Hubs",         Icon: Icons.FactoryIcon,  path: "/hub-list",          visible: true },
        { title: "Grain Hubs",   Icon: Icons.Agriculture,  path: "/admin/hubs",        visible: isSuperUser },
        { title: "Hub Members",  Icon: Icons.GroupAddIcon,  path: "/admin/membership",  visible: CanViewHubMembers || isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DEPOSITS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Deposits",
      Icon: Icons.AddBusinessIcon,
      visible: CanCreateDeposit || CanViewHubMembers || isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Deposit Grain",   Icon: Icons.AddBusinessIcon, path: "/admin/deposit",             visible: CanCreateDeposit || isSuperUser },
        { title: "Agent Deposits",  Icon: Icons.AddBusinessIcon, path: "/admin/deposit-management",  visible: CanViewHubMembers || isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADMIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Admin",
      Icon: Icons.PriceChangeIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Price Feed",     Icon: Icons.PriceChangeIcon, path: "/admin/price-feeds",     visible: isSuperUser },
        { title: "Grain Type",     Icon: Icons.GrainIcon,       path: "/admin/grain-types",     visible: isSuperUser },
        { title: "Quality Grade",  Icon: Icons.GradeIcon,       path: "/admin/quality-grades",  visible: isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TRADING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Trading",
      Icon: Icons.TrendingUpIcon,
      visible: isSuperUser || CanMakeTrades,
      isHeader: true,
      subMenu: [
        { title: "Dashboard", Icon: Icons.TrendingUpIcon, path: "/admin/trade/dashboard", visible: isSuperUser || CanMakeTrades },
        { title: "Trade",     Icon: Icons.TrendingUpIcon, path: "/admin/trade",           visible: isSuperUser || CanMakeTrades },
        { title: "CRM",       Icon: Icons.Diversity3Icon, path: "/admin/crm",             visible: isSuperUser || CanMakeTrades },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACCOUNTING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Accounting",
      Icon: Icons.CalculateIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Invoice",         Icon: Icons.ReceiptIcon,       path: "/admin/accounting",                  visible: isSuperUser },
        { title: "Payments",        Icon: Icons.PaymentsIcon,      path: "/admin/accounting/payments",         visible: isSuperUser },
        { title: "Journal Entries", Icon: Icons.LibraryBooksIcon,  path: "/admin/accounting/journal-entries",  visible: isSuperUser },
        { title: "Budgets",         Icon: Icons.AutoStoriesIcon,   path: "/admin/accounting/budgets",          visible: isSuperUser },
        { title: "Ledger Entries",  Icon: Icons.AccountTreeIcon,   path: "/admin/accounting/ledger-entries",   visible: isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INVENTORIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Inventories",
      Icon: Icons.InventoryIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Inventories", Icon: Icons.InventoryIcon, path: "/admin/inventories", visible: isSuperUser },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // USERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      title: "Users",
      Icon: Icons.GroupsIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        { title: "Users", Icon: Icons.GroupsIcon, path: "/admin/users", visible: isSuperUser },
      ],
    },
  ];
};

export default MenuList;






// import Icons from "../../icons/sidebar";

// export interface IMenuItem {
//   title: string;
//   Icon?: any;
//   path?: string;
//   subMenu?: IMenuItem[];
//   permissions?: string[];
//   users?: string[];
//   visible: boolean;
//   isHeader?: boolean;
// }

// export const MenuList = (
//   isSuperUser: boolean,
//   CanCreateDeposit: boolean,
//   CanViewHubMembers: boolean,
//   isHubAdmin: boolean,
//   CanMakeTrades: boolean,
//   userRole: string = ""
// ): IMenuItem[] => {
//   const isSupplier = userRole === "farmer";
//   const isInvestor = userRole === "investor";
//   const isStaff = ["super_admin", "hub_admin", "bdm", "finance"].includes(userRole);

//   return [
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // HOME
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Home",
//       Icon: Icons.HomeIcon,
//       path: "/dashboard",
//       visible: true,
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // MY FARMING (Supplier portal)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "My Farming",
//       Icon: Icons.Agriculture,
//       visible: isSupplier || isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Dashboard",       Icon: Icons.HomeIcon,         path: "/supplier/dashboard",        visible: isSupplier || isSuperUser },
//         { title: "My Orders",       Icon: Icons.ShoppingCartIcon, path: "/supplier/orders",           visible: isSupplier || isSuperUser },
//         { title: "Invoices",        Icon: Icons.ReceiptIcon,      path: "/supplier/invoices",         visible: isSupplier || isSuperUser },
//         { title: "Payment Methods", Icon: Icons.PaymentsIcon,     path: "/supplier/payment-methods",  visible: isSupplier || isSuperUser },
//         { title: "My Profile",      Icon: Icons.PeopleIcon,       path: "/supplier/profile",          visible: isSupplier || isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // MY INVESTMENTS (Investor portal)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "My Investments",
//       Icon: Icons.AccountBalanceIcon,
//       visible: isInvestor || isHubAdmin || isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Dashboard",           Icon: Icons.DashboardCustomizeIcon, path: "/invest",              visible: isInvestor || isHubAdmin || isSuperUser },
//         { title: "My Returns",          Icon: Icons.TrendingUpIcon,         path: "/invest/returns",      visible: isInvestor || isHubAdmin || isSuperUser },
//         { title: "Transaction History",  Icon: Icons.ReceiptIcon,           path: "/invest/transactions", visible: isInvestor || isHubAdmin || isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // REPORTS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Reports",
//       Icon: Icons.AssessmentIcon,
//       visible: isSuperUser || isHubAdmin,
//       isHeader: true,
//       subMenu: [
//         { title: "Reports & Analytics", Icon: Icons.AssessmentIcon, path: "/admin/reports", visible: isSuperUser || isHubAdmin },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // VOUCHERS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Vouchers",
//       Icon: Icons.ReceiptIcon,
//       visible: true,
//       isHeader: true,
//       subMenu: [
//         { title: "My Vouchers",  Icon: Icons.ReceiptIcon,            path: "/vouchers",            visible: true },
//         { title: "Redemptions",  Icon: Icons.ConfirmationNumberIcon, path: "/voucher-management",  visible: isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // SOURCING — REORGANISED BY TRADE FLOW with nested sub-groups
//     //
//     // The trade lifecycle:
//     //   1. Procurement:  Suppliers → Source Orders → Deliveries → Weighbridge
//     //   2. Payables:     Supplier Invoices → Supplier Payments
//     //   3. Investment:   Investor Allocations
//     //   4. Inventory:    Stock (Sale Lots) → Rejected Lots → Aggregator Costs
//     //   5. Sales:        Buyers → Buyer Orders → Buyer Invoices → Buyer Payments
//     //   6. Settlements:  Settlements & P&L
//     //
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Sourcing",
//       Icon: Icons.LocalShippingIcon,
//       visible: isStaff || isHubAdmin || isSuperUser,
//       isHeader: true,
//       subMenu: [
//         // ── Overview ──────────────────────────────────────────────────────
//         {
//           title: "Dashboard",
//           Icon: Icons.HomeIcon,
//           path: "/admin/sourcing/dashboard",
//           visible: isSuperUser || isHubAdmin,
//         },

//         // ── 1. Procurement (Buy Side) ────────────────────────────────────
//         // Follows the physical flow: find supplier → place order → truck
//         // arrives → weigh the grain
//         {
//           title: "Procurement",
//           Icon: Icons.ShoppingCartIcon,
//           visible: isStaff || isHubAdmin || isSuperUser,
//           isHeader: true,
//           subMenu: [
//             {
//               title: "Suppliers",
//               Icon: Icons.PeopleIcon,
//               path: "/admin/sourcing/suppliers",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Source Orders",
//               Icon: Icons.ShoppingCartIcon,
//               path: "/admin/sourcing/orders",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Deliveries",
//               Icon: Icons.LocalShippingIcon,
//               path: "/admin/sourcing/deliveries",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Weighbridge",
//               Icon: Icons.BalanceIcon,
//               path: "/admin/sourcing/weighbridge",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//           ],
//         },

//         // ── 2. Payables (Pay the Supplier) ───────────────────────────────
//         // After grain is received and weighed, invoice is generated and paid
//         {
//           title: "Payables",
//           Icon: Icons.PaymentsIcon,
//           visible: isStaff || isHubAdmin || isSuperUser,
//           isHeader: true,
//           subMenu: [
//             {
//               title: "Supplier Invoices",
//               Icon: Icons.ReceiptIcon,
//               path: "/admin/sourcing/invoices",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Supplier Payments",
//               Icon: Icons.PaymentsIcon,
//               path: "/admin/sourcing/payments",
//               visible: isSuperUser,
//             },
//             {
//               title: "Investor Allocations",
//               Icon: Icons.AccountBalanceIcon,
//               path: "/admin/sourcing/investor-allocations",
//               visible: isSuperUser,
//             },
//           ],
//         },

//         // ── 3. Inventory (What we hold) ──────────────────────────────────
//         // Grain is now in stock — tracked as sale lots
//         {
//           title: "Inventory",
//           Icon: Icons.InventoryIcon,
//           visible: isStaff || isHubAdmin || isSuperUser,
//           isHeader: true,
//           subMenu: [
//             {
//               title: "Stock (Sale Lots)",
//               Icon: Icons.InventoryIcon,
//               path: "/admin/sourcing/sale-lots",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Rejected Lots",
//               Icon: Icons.GradeIcon,
//               path: "/admin/sourcing/rejections",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Aggregator Costs",
//               Icon: Icons.AddBusinessIcon,
//               path: "/admin/sourcing/aggregator-costs",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//           ],
//         },

//         // ── 4. Sales (Sell Side) ─────────────────────────────────────────
//         // Grain sold to buyers — orders, invoiced, payments collected
//         {
//           title: "Sales",
//           Icon: Icons.AddBusinessIcon,
//           visible: isStaff || isHubAdmin || isSuperUser,
//           isHeader: true,
//           subMenu: [
//             {
//               title: "Buyers",
//               Icon: Icons.AddBusinessIcon,
//               path: "/admin/sourcing/buyers",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Buyer Orders",
//               Icon: Icons.ShoppingCartIcon,
//               path: "/admin/sourcing/buyer-orders",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Buyer Invoices",
//               Icon: Icons.ReceiptIcon,
//               path: "/admin/sourcing/buyer-invoices",
//               visible: isStaff || isHubAdmin || isSuperUser,
//             },
//             {
//               title: "Buyer Payments",
//               Icon: Icons.PaymentsIcon,
//               path: "/admin/sourcing/buyer-payments",
//               visible: isSuperUser,
//             },
//           ],
//         },

//         // ── 5. Settlements (Close the Loop) ──────────────────────────────
//         // Trade is complete — calculate P&L, investor returns
//         {
//           title: "Settlements",
//           Icon: Icons.TrendingUpIcon,
//           visible: isSuperUser,
//           isHeader: true,
//           subMenu: [
//             {
//               title: "Settlements & P&L",
//               Icon: Icons.TrendingUpIcon,
//               path: "/admin/sourcing/settlements",
//               visible: isSuperUser,
//             },
//           ],
//         },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // INVEST (Admin)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Invest",
//       Icon: Icons.DashboardCustomizeIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Investor Portal",      Icon: Icons.DashboardCustomizeIcon, path: "/invest",                        visible: isSuperUser },
//         { title: "Investors Admin",      Icon: Icons.FolderSharedIcon,       path: "/admin/investors",               visible: isSuperUser },
//         { title: "Investor Receivables", Icon: Icons.TrendingUpIcon,         path: "/admin/investors/receivables",   visible: isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // HUBS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Hubs",
//       Icon: Icons.FactoryIcon,
//       visible: true,
//       isHeader: true,
//       subMenu: [
//         { title: "Hubs",         Icon: Icons.FactoryIcon,  path: "/hub-list",          visible: true },
//         { title: "Grain Hubs",   Icon: Icons.Agriculture,  path: "/admin/hubs",        visible: isSuperUser },
//         { title: "Hub Members",  Icon: Icons.GroupAddIcon,  path: "/admin/membership",  visible: CanViewHubMembers || isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // DEPOSITS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Deposits",
//       Icon: Icons.AddBusinessIcon,
//       visible: CanCreateDeposit || CanViewHubMembers || isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Deposit Grain",   Icon: Icons.AddBusinessIcon, path: "/admin/deposit",             visible: CanCreateDeposit || isSuperUser },
//         { title: "Agent Deposits",  Icon: Icons.AddBusinessIcon, path: "/admin/deposit-management",  visible: CanViewHubMembers || isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // ADMIN
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Admin",
//       Icon: Icons.PriceChangeIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Price Feed",     Icon: Icons.PriceChangeIcon, path: "/admin/price-feeds",     visible: isSuperUser },
//         { title: "Grain Type",     Icon: Icons.GrainIcon,       path: "/admin/grain-types",     visible: isSuperUser },
//         { title: "Quality Grade",  Icon: Icons.GradeIcon,       path: "/admin/quality-grades",  visible: isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // TRADING
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Trading",
//       Icon: Icons.TrendingUpIcon,
//       visible: isSuperUser || CanMakeTrades,
//       isHeader: true,
//       subMenu: [
//         { title: "Dashboard", Icon: Icons.TrendingUpIcon, path: "/admin/trade/dashboard", visible: isSuperUser || CanMakeTrades },
//         { title: "Trade",     Icon: Icons.TrendingUpIcon, path: "/admin/trade",           visible: isSuperUser || CanMakeTrades },
//         { title: "CRM",       Icon: Icons.Diversity3Icon, path: "/admin/crm",             visible: isSuperUser || CanMakeTrades },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // ACCOUNTING
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Accounting",
//       Icon: Icons.CalculateIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Invoice",         Icon: Icons.ReceiptIcon,       path: "/admin/accounting",                  visible: isSuperUser },
//         { title: "Payments",        Icon: Icons.PaymentsIcon,      path: "/admin/accounting/payments",         visible: isSuperUser },
//         { title: "Journal Entries", Icon: Icons.LibraryBooksIcon,  path: "/admin/accounting/journal-entries",  visible: isSuperUser },
//         { title: "Budgets",         Icon: Icons.AutoStoriesIcon,   path: "/admin/accounting/budgets",          visible: isSuperUser },
//         { title: "Ledger Entries",  Icon: Icons.AccountTreeIcon,   path: "/admin/accounting/ledger-entries",   visible: isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // INVENTORIES
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Inventories",
//       Icon: Icons.InventoryIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Inventories", Icon: Icons.InventoryIcon, path: "/admin/inventories", visible: isSuperUser },
//       ],
//     },

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // USERS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     {
//       title: "Users",
//       Icon: Icons.GroupsIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         { title: "Users", Icon: Icons.GroupsIcon, path: "/admin/users", visible: isSuperUser },
//       ],
//     },
//   ];
// };

// export default MenuList;