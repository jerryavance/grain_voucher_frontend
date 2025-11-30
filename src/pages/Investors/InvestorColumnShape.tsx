import { FC } from "react";
import { Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { IInvestorAccount } from "./Investor.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const InvestorDetailsLink: FC<{
  id: string;
  name: string;
  onView: (account: IInvestorAccount) => void;
  account: IInvestorAccount;
}> = ({ name, onView, account }) => {
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => onView(account)}
    >
      {name}
    </Typography>
  );
};

export const InvestorAccountColumnShape = (actions: IDropdownAction[], onView: (account: IInvestorAccount) => void) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor, id } = row.original;
      return (
        <InvestorDetailsLink
          id={id}
          name={`${investor.first_name} ${investor.last_name}`}
          onView={onView}
          account={row.original}
        />
      );
    },
  },
  {
    Header: "Phone Number",
    accessor: "investor.phone_number",
    minWidth: 150,
  },
  {
    Header: "Total Deposited",
    accessor: "total_deposited",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.total_deposited).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Available Balance",
    accessor: "available_balance",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.available_balance).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Total Utilized",
    accessor: "total_utilized",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.total_utilized).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Margin Earned",
    accessor: "total_margin_earned",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.total_margin_earned).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Total Value",
    accessor: "total_value",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.total_value).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Created Date",
    accessor: "created_at",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.created_at)}</Span>;
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export const DepositColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    }
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.amount).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Deposit Date",
    accessor: "deposit_date",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.deposit_date)}</Span>;
    }
  },
  {
    Header: "Notes",
    accessor: "notes",
    minWidth: 200,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export const WithdrawalColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    }
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.amount).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const status = row.original.status;
      const color = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
      return <Chip label={status.toUpperCase()} color={color} size="small" />;
    }
  },
  {
    Header: "Withdrawal Date",
    accessor: "withdrawal_date",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.withdrawal_date)}</Span>;
    }
  },
  {
    Header: "Approved By",
    accessor: "approved_by",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { approved_by } = row.original;
      return <Span>{approved_by ? `${approved_by.first_name} ${approved_by.last_name}` : 'N/A'}</Span>;
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      const filteredActions = data.status === 'pending' ? actions : [];
      return <DropdownActionBtn key={row.id} actions={filteredActions} metaData={data}/>
    }
  },
];

export const ProfitAgreementColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    }
  },
  {
    Header: "Profit Threshold",
    accessor: "profit_threshold",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span>{row.original.profit_threshold}%</Span>;
    }
  },
  {
    Header: "Investor Share",
    accessor: "investor_share",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span color="success.main">{row.original.investor_share}%</Span>;
    }
  },
  {
    Header: "BENNU Share",
    accessor: "bennu_share",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span color="info.main">{row.original.bennu_share}%</Span>;
    }
  },
  {
    Header: "Effective Date",
    accessor: "effective_date",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.effective_date)}</Span>;
    }
  },
  {
    Header: "Notes",
    accessor: "notes",
    minWidth: 200,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export default InvestorAccountColumnShape;