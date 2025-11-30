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
  CanMakeTrades: boolean
): IMenuItem[] => {
  return [
    {
      title: "Home",
      Icon: Icons.HomeIcon,
      path: "/dashboard",
      visible: true,
    },
    {
      title: "Vouchers",
      Icon: Icons.ReceiptIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        {
          title: "My Vouchers",
          Icon: Icons.ReceiptIcon,
          path: "/dashboard/vouchers",
          visible: true,
        },
        {
          title: "Redemptions",
          Icon: Icons.ConfirmationNumberIcon,
          path: "/dashboard/voucher-management",
          visible: isSuperUser,
        },
      ],
    },
    {
      title: "Invest",
      Icon: Icons.DashboardCustomizeIcon,
      visible: true,
      isHeader: true,
      subMenu: [
        {
          title: "Investments",
          Icon: Icons.DashboardCustomizeIcon,
          path: "/dashboard/invest",
          visible: true,
        },
        {
          title: "Investors",
          Icon: Icons.FolderSharedIcon,
          path: "/admin/investors",
          visible: isSuperUser,
        },
      ],
    },
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
          visible: CanViewHubMembers,
        },
      ],
    },
    {
      title: "Deposits",
      Icon: Icons.AddBusinessIcon,
      visible: CanCreateDeposit || CanViewHubMembers,
      isHeader: true,
      subMenu: [
        {
          title: "Deposit Grain",
          Icon: Icons.AddBusinessIcon,
          path: "/admin/deposit",
          visible: CanCreateDeposit,
        },
        {
          title: "Agent Deposits",
          Icon: Icons.AddBusinessIcon,
          path: "/admin/deposit-management",
          visible: CanViewHubMembers,
        },
      ],
    },
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
    {
      title: "Trading",
      Icon: Icons.TrendingUpIcon,
      visible: isSuperUser || CanMakeTrades,
      isHeader: true,
      subMenu: [
        {
          title: "dashboard",
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
