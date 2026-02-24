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
  // Role checks
  const isSupplier = userRole === "farmer";
  const isInvestor = userRole === "investor";
  const isStaff = ["super_admin", "hub_admin", "bdm", "finance"].includes(userRole);

  return [
    // HOME - Everyone sees this
    {
      title: "Home",
      Icon: Icons.HomeIcon,
      path: "/dashboard",
      visible: true,
    },

    // MY FARMING - Farmers + Super Admin
    {
      title: "My Farming",
      Icon: Icons.Agriculture,
      visible: isSupplier || isSuperUser, // Super admin sees everything
      isHeader: true,
      subMenu: [
        {
          title: "Dashboard",
          Icon: Icons.HomeIcon,
          path: "/supplier/dashboard",
          visible: isSupplier || isSuperUser,
        },
        {
          title: "My Orders",
          Icon: Icons.ShoppingCartIcon,
          path: "/supplier/orders",
          visible: isSupplier || isSuperUser,
        },
        {
          title: "Invoices",
          Icon: Icons.ReceiptIcon,
          path: "/supplier/invoices",
          visible: isSupplier || isSuperUser,
        },
        {
          title: "Payment Methods",
          Icon: Icons.PaymentsIcon,
          path: "/supplier/payment-methods",
          visible: isSupplier || isSuperUser,
        },
        {
          title: "My Profile",
          Icon: Icons.PeopleIcon,
          path: "/supplier/profile",
          visible: isSupplier || isSuperUser,
        },
      ],
    },

    // MY INVESTMENTS - Investors + Super Admin
    {
      title: "My Investments",
      Icon: Icons.AccountBalanceIcon,
      visible: isInvestor || isHubAdmin || isSuperUser, // Super admin sees everything
      isHeader: true,
      subMenu: [
        {
          title: "Dashboard",
          Icon: Icons.DashboardCustomizeIcon,
          path: "/invest",
          visible: isInvestor || isHubAdmin || isSuperUser,
        },
        {
          title: "My Returns",
          Icon: Icons.TrendingUpIcon,
          path: "/invest/returns",
          visible: isInvestor || isHubAdmin || isSuperUser,
        },
        {
          title: "Transaction History",
          Icon: Icons.ReceiptIcon,
          path: "/invest/transactions",
          visible: isInvestor || isHubAdmin || isSuperUser,
        },
      ],
    },

    // REPORTS - Staff + Super Admin
    {
      title: "Reports",
      Icon: Icons.AssessmentIcon,
      visible: isSuperUser || isHubAdmin,
      isHeader: true,
      subMenu: [
        {
          title: "Reports & Analytics",
          Icon: Icons.AssessmentIcon,
          path: "/admin/reports",
          visible: isSuperUser || isHubAdmin,
        },
      ],
    },

    // VOUCHERS - Everyone
    {
      title: "Vouchers",
      Icon: Icons.ReceiptIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        {
          title: "My Vouchers",
          Icon: Icons.ReceiptIcon,
          path: "/vouchers",
          visible: true,
        },
        {
          title: "Redemptions",
          Icon: Icons.ConfirmationNumberIcon,
          path: "/voucher-management",
          visible: isSuperUser,
        },
      ],
    },

    // SOURCING - Staff + Super Admin
    {
      title: "Sourcing",
      Icon: Icons.LocalShippingIcon,
      visible: isStaff || isHubAdmin || isSuperUser, // Super admin sees everything
      isHeader: true,
      subMenu: [
        {
          title: "Dashboard",
          Icon: Icons.HomeIcon,
          path: "/admin/sourcing/dashboard",
          visible: isSuperUser || isHubAdmin,
        },
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
          title: "Stock (Sale Lots)",
          Icon: Icons.InventoryIcon,
          path: "/admin/sourcing/sale-lots",
          visible: isStaff || isHubAdmin || isSuperUser,
        },
        {
          title: "Investor Allocations",
          Icon: Icons.AccountBalanceIcon,
          path: "/admin/sourcing/investor-allocations",
          visible: isSuperUser,
        },
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
        {
          title: "Settlements & P&L",
          Icon: Icons.TrendingUpIcon,
          path: "/admin/sourcing/settlements",
          visible: isSuperUser,
        },
      ],
    },

    // INVEST - Super admin only
    {
      title: "Invest",
      Icon: Icons.DashboardCustomizeIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        {
          title: "Investor Portal",
          Icon: Icons.DashboardCustomizeIcon,
          path: "/invest",
          visible: isSuperUser,
        },
        {
          title: "Investors Admin",
          Icon: Icons.FolderSharedIcon,
          path: "/admin/investors",
          visible: isSuperUser,
        },
      ],
    },

    // HUBS - Everyone can see hub list
    {
      title: "Hubs",
      Icon: Icons.FactoryIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        {
          title: "Hubs",
          Icon: Icons.FactoryIcon,
          path: "/hub-list",
          visible: true,
        },
        {
          title: "Grain Hubs",
          Icon: Icons.Agriculture,
          path: "/admin/hubs",
          visible: isSuperUser,
        },
        {
          title: "Hub Members",
          Icon: Icons.GroupAddIcon,
          path: "/admin/membership",
          visible: CanViewHubMembers || isSuperUser, // Super admin sees everything
        },
      ],
    },

    // DEPOSITS - Permission based + Super Admin
    {
      title: "Deposits",
      Icon: Icons.AddBusinessIcon,
      visible: CanCreateDeposit || CanViewHubMembers || isSuperUser, // Super admin sees everything
      isHeader: true,
      subMenu: [
        {
          title: "Deposit Grain",
          Icon: Icons.AddBusinessIcon,
          path: "/admin/deposit",
          visible: CanCreateDeposit || isSuperUser,
        },
        {
          title: "Agent Deposits",
          Icon: Icons.AddBusinessIcon,
          path: "/admin/deposit-management",
          visible: CanViewHubMembers || isSuperUser,
        },
      ],
    },

    // ADMIN - Super user only
    {
      title: "Admin",
      Icon: Icons.PriceChangeIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        {
          title: "Price Feed",
          Icon: Icons.PriceChangeIcon,
          path: "/admin/price-feeds",
          visible: isSuperUser,
        },
        {
          title: "Grain Type",
          Icon: Icons.GrainIcon,
          path: "/admin/grain-types",
          visible: isSuperUser,
        },
        {
          title: "Quality Grade",
          Icon: Icons.GradeIcon,
          path: "/admin/quality-grades",
          visible: isSuperUser,
        },
      ],
    },

    // TRADING - Super user or traders
    {
      title: "Trading",
      Icon: Icons.TrendingUpIcon,
      visible: isSuperUser || CanMakeTrades,
      isHeader: true,
      subMenu: [
        {
          title: "Dashboard",
          Icon: Icons.TrendingUpIcon,
          path: "/admin/trade/dashboard",
          visible: isSuperUser || CanMakeTrades,
        },
        {
          title: "Trade",
          Icon: Icons.TrendingUpIcon,
          path: "/admin/trade",
          visible: isSuperUser || CanMakeTrades,
        },
        {
          title: "CRM",
          Icon: Icons.Diversity3Icon,
          path: "/admin/crm",
          visible: isSuperUser || CanMakeTrades,
        },
      ],
    },

    // ACCOUNTING - Super user only
    {
      title: "Accounting",
      Icon: Icons.CalculateIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        {
          title: "Invoice",
          Icon: Icons.ReceiptIcon,
          path: "/admin/accounting",
          visible: isSuperUser,
        },
        {
          title: "Payments",
          Icon: Icons.PaymentsIcon,
          path: "/admin/accounting/payments",
          visible: isSuperUser,
        },
        {
          title: "Journal Entries",
          Icon: Icons.LibraryBooksIcon,
          path: "/admin/accounting/journal-entries",
          visible: isSuperUser,
        },
        {
          title: "Budgets",
          Icon: Icons.AutoStoriesIcon,
          path: "/admin/accounting/budgets",
          visible: isSuperUser,
        },
        {
          title: "Ledger Entries",
          Icon: Icons.AccountTreeIcon,
          path: "/admin/accounting/ledger-entries",
          visible: isSuperUser,
        },
      ],
    },

    // INVENTORIES - Super user only
    {
      title: "Inventories",
      Icon: Icons.InventoryIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        {
          title: "Inventories",
          Icon: Icons.InventoryIcon,
          path: "/admin/inventories",
          visible: isSuperUser,
        },
      ],
    },

    // USERS - Super user only
    {
      title: "Users",
      Icon: Icons.GroupsIcon,
      visible: isSuperUser,
      isHeader: true,
      subMenu: [
        {
          title: "Users",
          Icon: Icons.GroupsIcon,
          path: "/admin/users",
          visible: isSuperUser,
        },
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
//   userRole: string = "" // 🆕 ADDED
// ): IMenuItem[] => {
//   // 🆕 ADDED THESE 3 LINES
//   const isSupplier = userRole === "farmer";
//   const isInvestor = userRole === "investor";
//   const isStaff = ["super_admin", "hub_admin", "bdm", "finance"].includes(userRole);
//   return [
//     {
//       title: "Home",
//       Icon: Icons.HomeIcon,
//       path: "/dashboard",
//       visible: true,
//     },
//     // 🆕 ADDED SUPPLIER MENU
//     {
//       title: "My Farming",
//       Icon: Icons.Agriculture,
//       // visible: isSupplier || isHubAdmin,
//       visible: true,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Dashboard",
//           Icon: Icons.HomeIcon,
//           path: "/supplier/dashboard",
//           // visible: isSupplier,
//           visible: true,
//         },
//         {
//           title: "My Orders",
//           Icon: Icons.ShoppingCartIcon,
//           path: "/supplier/orders",
//           // visible: isSupplier,
//           visible: true,
//         },
//         {
//           title: "Invoices",
//           Icon: Icons.ReceiptIcon,
//           path: "/supplier/invoices",
//           visible: true,
//           // visible: isSupplier,
//         },
//         {
//           title: "Payment Methods",
//           Icon: Icons.PaymentsIcon,
//           path: "/supplier/payment-methods",
//           // visible: isSupplier,
//           visible: true,
//         },
//         {
//           title: "My Profile",
//           Icon: Icons.PeopleIcon,
//           path: "/supplier/profile",
//           // visible: isSupplier,
//           visible: true,
//         },
//       ],
//     },

//     // 🆕 ADDED INVESTOR MENU
//     {
//       title: "My Investments",
//       Icon: Icons.AccountBalanceIcon,
//       visible: isInvestor || isHubAdmin,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Dashboard",
//           Icon: Icons.DashboardCustomizeIcon,
//           path: "/invest",
//           visible: isInvestor || isHubAdmin,
//         },
//         {
//           title: "My Returns",
//           Icon: Icons.TrendingUpIcon,
//           path: "/invest/returns",
//           visible: isInvestor || isHubAdmin,
//         },
//         {
//           title: "Transaction History",
//           Icon: Icons.ReceiptIcon,
//           path: "/invest/transactions",
//           visible: isInvestor || isHubAdmin,
//         },
//       ],
//     },
//     {
//       title: "Reports",
//       Icon: Icons.AssessmentIcon,
//       visible: isSuperUser || isHubAdmin,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Reports & Analytics",
//           Icon: Icons.AssessmentIcon,
//           path: "/admin/reports",
//           visible: isSuperUser || isHubAdmin,
//         },
//       ],
//     },
//     {
//       title: "Vouchers",
//       Icon: Icons.ReceiptIcon,
//       visible: true,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "My Vouchers",
//           Icon: Icons.ReceiptIcon,
//           path: "/vouchers",
//           visible: true,
//         },
//         {
//           title: "Redemptions",
//           Icon: Icons.ConfirmationNumberIcon,
//           path: "/voucher-management",
//           visible: isSuperUser,
//         },
//       ],
//     },
//     {
//       title: "Sourcing",
//       Icon: Icons.LocalShippingIcon,
//       visible: isStaff || isHubAdmin, // 🔄 UPDATED
//       isHeader: true,
//       subMenu: [
//         // Keep all your existing sourcing submenu items
//         {
//           title: "Dashboard",
//           Icon: Icons.HomeIcon,
//           path: "/admin/sourcing/dashboard",
//           visible: isSuperUser || isHubAdmin || isHubAdmin,
//         },
//         {
//           title: "Suppliers",
//           Icon: Icons.PeopleIcon,
//           path: "/admin/sourcing/suppliers",
//           visible: isStaff || isHubAdmin,
//         },
//         {
//           title: "Source Orders",
//           Icon: Icons.ShoppingCartIcon,
//           path: "/admin/sourcing/orders",
//           visible: isStaff || isHubAdmin,
//         },
//         {
//           title: "Deliveries",
//           Icon: Icons.LocalShippingIcon,
//           path: "/admin/sourcing/deliveries",
//           visible: isStaff,
//         },
//         {
//           title: "Weighbridge",
//           Icon: Icons.BalanceIcon,
//           path: "/admin/sourcing/weighbridge",
//           visible: isStaff,
//         },
//         {
//           title: "Invoices",
//           Icon: Icons.ReceiptIcon,
//           path: "/admin/sourcing/invoices",
//           visible: isStaff,
//         },
//         {
//           title: "Payments",
//           Icon: Icons.PaymentsIcon,
//           path: "/admin/sourcing/payments",
//           visible: isSuperUser,
//         },
//         {
//           title: "Stock (Sale Lots)",
//           Icon: Icons.InventoryIcon,
//           path: "/admin/sourcing/sale-lots",
//           visible: isStaff,
//         },
//         {
//           title: "Investor Allocations",
//           Icon: Icons.AccountBalanceIcon,
//           path: "/admin/sourcing/investor-allocations",
//           visible: isSuperUser,
//         },
//         {
//           title: "Buyer Orders",
//           Icon: Icons.ShoppingCartIcon,
//           path: "/admin/sourcing/buyer-orders",
//           visible: isStaff,
//         },
//         {
//           title: "Buyer Invoices",
//           Icon: Icons.ReceiptIcon,
//           path: "/admin/sourcing/buyer-invoices",
//           visible: isStaff,
//         },
//         {
//           title: "Buyer Payments",
//           Icon: Icons.PaymentsIcon,
//           path: "/admin/sourcing/buyer-payments",
//           visible: isSuperUser,
//         },
//         {
//           title: "Settlements & P&L",
//           Icon: Icons.TrendingUpIcon,
//           path: "/admin/sourcing/settlements",
//           visible: isSuperUser,
//         },
//       ],
//     },
//     {
//       title: "Invest",
//       Icon: Icons.DashboardCustomizeIcon,
//       visible: isSuperUser, // 🔄 UPDATED
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Investor Portal",
//           Icon: Icons.DashboardCustomizeIcon,
//           path: "/invest",
//           visible: true,
//         },
//         {
//           title: "Investors Admin",
//           Icon: Icons.FolderSharedIcon,
//           path: "/admin/investors",
//           visible: isSuperUser,
//         },
//       ],
//     },

//     {
//       title: "Hubs",
//       Icon: Icons.FactoryIcon,
//       visible: true,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Hubs",
//           Icon: Icons.FactoryIcon,
//           path: "/hub-list",
//           visible: true,
//         },
//         {
//           title: "Grain Hubs",
//           Icon: Icons.Agriculture,
//           path: "/admin/hubs",
//           visible: isSuperUser,
//         },
//         {
//           title: "Hub Members",
//           Icon: Icons.GroupAddIcon,
//           path: "/admin/membership",
//           visible: CanViewHubMembers,
//         },
//       ],
//     },
//     {
//       title: "Deposits",
//       Icon: Icons.AddBusinessIcon,
//       visible: CanCreateDeposit || CanViewHubMembers,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Deposit Grain",
//           Icon: Icons.AddBusinessIcon,
//           path: "/admin/deposit",
//           visible: CanCreateDeposit,
//         },
//         {
//           title: "Agent Deposits",
//           Icon: Icons.AddBusinessIcon,
//           path: "/admin/deposit-management",
//           visible: CanViewHubMembers,
//         },
//       ],
//     },
//     {
//       title: "Admin",
//       Icon: Icons.PriceChangeIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Price Feed",
//           Icon: Icons.PriceChangeIcon,
//           path: "/admin/price-feeds",
//           visible: isSuperUser,
//         },
//         {
//           title: "Grain Type",
//           Icon: Icons.GrainIcon,
//           path: "/admin/grain-types",
//           visible: isSuperUser,
//         },
//         {
//           title: "Quality Grade",
//           Icon: Icons.GradeIcon,
//           path: "/admin/quality-grades",
//           visible: isSuperUser,
//         },
//       ],
//     },
//     {
//       title: "Trading",
//       Icon: Icons.TrendingUpIcon,
//       visible: isSuperUser || CanMakeTrades,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "dashboard",
//           Icon: Icons.TrendingUpIcon,
//           path: "/admin/trade/dashboard",
//           visible: isSuperUser || CanMakeTrades,
//         },
//         {
//           title: "Trade",
//           Icon: Icons.TrendingUpIcon,
//           path: "/admin/trade",
//           visible: isSuperUser || CanMakeTrades,
//         },
//         {
//           title: "CRM",
//           Icon: Icons.Diversity3Icon,
//           path: "/admin/crm",
//           visible: isSuperUser || CanMakeTrades,
//         },
//       ],
//     },
//     {
//       title: "Accounting",
//       Icon: Icons.CalculateIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Invoice",
//           Icon: Icons.ReceiptIcon,
//           path: "/admin/accounting",
//           visible: isSuperUser,
//         },
//         {
//           title: "Payments",
//           Icon: Icons.PaymentsIcon,
//           path: "/admin/accounting/payments",
//           visible: isSuperUser,
//         },
//         {
//           title: "Journal Entries",
//           Icon: Icons.LibraryBooksIcon,
//           path: "/admin/accounting/journal-entries",
//           visible: isSuperUser,
//         },
//         {
//           title: "Budgets",
//           Icon: Icons.AutoStoriesIcon,
//           path: "/admin/accounting/budgets",
//           visible: isSuperUser,
//         },
//         {
//           title: "Ledger Entries",
//           Icon: Icons.AccountTreeIcon,
//           path: "/admin/accounting/ledger-entries",
//           visible: isSuperUser,
//         },
//       ],
//     },
//     {
//       title: "Inventories",
//       Icon: Icons.InventoryIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Inventories",
//           Icon: Icons.InventoryIcon,
//           path: "/admin/inventories",
//           visible: isSuperUser,
//         },
//       ],
//     },
//     {
//       title: "Users",
//       Icon: Icons.GroupsIcon,
//       visible: isSuperUser,
//       isHeader: true,
//       subMenu: [
//         {
//           title: "Users",
//           Icon: Icons.GroupsIcon,
//           path: "/admin/users",
//           visible: isSuperUser,
//         },
//       ],
//     },
//   ];
// };

// export default MenuList;



// import Icons from "../../icons/sidebar";
// export interface IMenuItem {
//   title: string;
//   Icon?: any;
//   path: string;
//   subMenu?: IMenuItem[];
//   permissions?: string[];
//   users?: string[];
//   visible: boolean;
// }

// export const MenuList = (isSuperUser: boolean, CanCreateDeposit: boolean , CanViewHubMembers: boolean, isHubAdmin: boolean, CanMakeTrades: boolean): IMenuItem[] => {
//   return [
//     {
//       title: "Home",
//       Icon: Icons.HomeIcon,
//       path: "/dashboard",
//       visible: true,
//     },
//     {
//       title: "Vouchers", 
//       // Icon: Icons.ConfirmationNumberIcon, 
//       Icon: Icons.ReceiptIcon,    
//       path: "/dashboard/vouchers",
//       visible: true,
//     },
//     {
//       title: "Invest",
//       Icon: Icons.DashboardCustomizeIcon,
//       path: "/dashboard/invest", 
//       visible: true,
//       // visible: isSuperUser,
//     },
//     {
//       title: "Investors",
//       Icon: Icons.FolderSharedIcon,
//       path: "/admin/investors", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Hubs", //done
//       Icon: Icons.FactoryIcon,
//       path: "/hub-list", 
//       visible: true,
//     },
//     {
//       title: "Hub Members",
//       Icon: Icons.GroupAddIcon,
//       path: "/admin/membership", 
//       visible: CanViewHubMembers,
//     },
//     {
//       title: "Agent Deposits",
//       Icon: Icons.AddBusinessIcon,
//       path: "/admin/deposit-management", 
//       visible: CanViewHubMembers,
//     },
//     {
//       title: "Deposit Grain",
//       Icon: Icons.AddBusinessIcon,
//       path: "/admin/deposit", 
//       visible: CanCreateDeposit,
//     },
//     {
//       title: "Price Feed",
//       Icon: Icons.PriceChangeIcon,
//       path: "/admin/price-feeds", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Grain Type",
//       Icon: Icons.GrainIcon,
//       path: "/admin/grain-types", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Quality Grade",
//       Icon: Icons.GradeIcon,
//       path: "/admin/quality-grades", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Trade",
//       Icon: Icons.TrendingUpIcon,
//       path: "/admin/trade", 
//       visible: isSuperUser || CanMakeTrades,
//     },
//     {
//       title: "CRM",
//       Icon: Icons.Diversity3Icon,
//       path: "/admin/crm", 
//       visible: isSuperUser || CanMakeTrades,
//     },
//     {
//       title: "Accounting",
//       Icon: Icons.CalculateIcon,
//       path: "/admin/accounting", 
//       visible: isSuperUser,
//     },
//     // {
//     //   title: "Payroll",
//     //   Icon: Icons.PaymentsIcon,
//     //   path: "/admin/pay-roll", 
//     //   visible: isSuperUser,
//     // },
//     {
//       title: "Redemptions",
//       Icon: Icons.ConfirmationNumberIcon,   
//       path: "/dashboard/voucher-management",
//       visible: isSuperUser,
//     },
//     {
//       title: "Inventories",
//       Icon: Icons.InventoryIcon,
//       path: "/admin/inventories", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Ledger Entries",
//       Icon: Icons.AccountTreeIcon,
//       path: "/admin/ledger-entries", 
//       visible: isSuperUser,
//     },
//     {
//       title: "Grain Hubs", 
//       Icon: Icons.Agriculture,
//       path: "/hubs",
//       visible: isSuperUser,
//     },
//     {
//       title: "Users",
//       Icon: Icons.GroupsIcon,
//       path: "/users",
//       // visible: isSuperUser,
//       visible: isSuperUser,
//     },
//   ];
// };

// export default MenuList;
