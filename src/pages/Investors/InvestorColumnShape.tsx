import { FC } from "react";
import { Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const InvestorDetailsLink: FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/investors/details/${id}`)}
    >
      {name}
    </Typography>
  );
};

export const InvestorAccountColumnShape = (actions: IDropdownAction[]) => [
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
        />
      );
    }
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
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export const TradeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "GRN Number",
    accessor: "grn_number",
    minWidth: 150,
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 150,
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_details.name",
    minWidth: 150,
  },
  {
    Header: "Net Tonnage",
    accessor: "net_tonnage",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span>{parseFloat(row.original.net_tonnage).toFixed(2)} MT</Span>;
    }
  },
  {
    Header: "Buying Price",
    accessor: "buying_price",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.buying_price).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Selling Price",
    accessor: "selling_price",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.selling_price).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Margin",
    accessor: "margin",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.margin).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Payment Status",
    accessor: "payment_status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const status = row.original.payment_status;
      const color = status === 'paid' ? 'success' : status === 'overdue' ? 'error' : 'warning';
      return <Chip label={status.toUpperCase()} color={color} size="small" />;
    }
  },
  {
    Header: "Delivery Status",
    accessor: "delivery_status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const status = row.original.delivery_status;
      const color = status === 'delivered' ? 'success' : 'warning';
      return <Chip label={status.toUpperCase()} color={color} size="small" />;
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

export const TradeAllocationColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Trade GRN",
    accessor: "trade.grn_number",
    minWidth: 150,
  },
  {
    Header: "Investor",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    }
  },
  {
    Header: "Allocated Amount",
    accessor: "allocated_amount",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.allocated_amount).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Margin Earned",
    accessor: "margin_earned",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.margin_earned).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Investor Margin",
    accessor: "investor_margin",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.investor_margin).toLocaleString()}</Span>;
    }
  },
  {
    Header: "AMSAF Margin",
    accessor: "amsaf_margin",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.amsaf_margin).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Allocation Date",
    accessor: "allocation_date",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.allocation_date)}</Span>;
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

export const LoanColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Trade GRN",
    accessor: "trade.grn_number",
    minWidth: 150,
  },
  {
    Header: "Investor",
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
    Header: "Interest Rate",
    accessor: "interest_rate",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span>{row.original.interest_rate}%</Span>;
    }
  },
  {
    Header: "Amount Repaid",
    accessor: "amount_repaid",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>UGX {parseFloat(row.original.amount_repaid).toLocaleString()}</Span>;
    }
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const status = row.original.status;
      const colorMap: Record<string, any> = {
        repaid: 'success',
        active: 'info',
        pending: 'warning',
        defaulted: 'error'
      };
      return <Chip label={status.toUpperCase()} color={colorMap[status]} size="small" />;
    }
  },
  {
    Header: "Due Date",
    accessor: "due_date",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return <Span>{formatDateToDDMMYYYY(row.original.due_date)}</Span>;
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

export default InvestorAccountColumnShape;