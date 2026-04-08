import { FC } from "react";
import { Typography, Chip, Box, LinearProgress, Tooltip } from "@mui/material";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { IInvestorAccount, IMarginPayout } from "./Investor.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

const fmt = (val: string | number) =>
  `UGX ${parseFloat(val?.toString() || "0").toLocaleString()}`;

export const InvestorDetailsLink: FC<{
  id: string;
  name: string;
  onView: (account: IInvestorAccount) => void;
  account: IInvestorAccount;
}> = ({ name, onView, account }) => (
  <Typography
    sx={styledTypography}
    color="primary"
    variant="h6"
    onClick={() => onView(account)}
  >
    {name}
  </Typography>
);

// ─── EMD Utilisation mini-bar ────────────────────────────────────────────────
const EMDBar: FC<{ emdBalance: string; emdUtilized: string }> = ({
  emdBalance,
  emdUtilized,
}) => {
  const balance = parseFloat(emdBalance || "0");
  const utilized = parseFloat(emdUtilized || "0");
  const total = balance + utilized;
  const pct = total > 0 ? (utilized / total) * 100 : 0;
  return (
    <Tooltip
      title={`EMD Available: ${fmt(balance)} | In Trade: ${fmt(utilized)}`}
    >
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="caption" color="success.main" fontWeight="bold">
          {fmt(balance)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 6,
            borderRadius: 3,
            mt: 0.5,
            bgcolor: "#e8f5e9",
            "& .MuiLinearProgress-bar": { bgcolor: pct > 80 ? "#ef5350" : "#43a047" },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {pct.toFixed(0)}% utilized
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ─── Investor Account Columns ────────────────────────────────────────────────
export const InvestorAccountColumnShape = (
  actions: IDropdownAction[],
  onView: (account: IInvestorAccount) => void
) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return (
        <InvestorDetailsLink
          id={row.original.id}
          name={`${investor.first_name} ${investor.last_name}`}
          onView={onView}
          account={row.original}
        />
      );
    },
  },
  {
    Header: "Phone",
    accessor: "investor.phone_number",
    minWidth: 140,
  },
  {
    Header: "EMD Balance",
    accessor: "emd_balance",
    minWidth: 170,
    Cell: ({ row }: any) => (
      <EMDBar
        emdBalance={row.original.emd_balance ?? row.original.available_balance}
        emdUtilized={row.original.emd_utilized ?? row.original.total_utilized}
      />
    ),
  },
  {
    Header: "Total Deposited",
    accessor: "total_deposited",
    minWidth: 150,
    Cell: ({ row }: any) => <Span>{fmt(row.original.total_deposited)}</Span>,
  },
  {
    Header: "Margin Earned",
    accessor: "total_margin_earned",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Typography color="success.main" variant="body2" fontWeight="bold">
        {fmt(row.original.total_margin_earned)}
      </Typography>
    ),
  },
  {
    Header: "Margin Paid",
    accessor: "total_margin_paid",
    minWidth: 150,
    Cell: ({ row }: any) => <Span>{fmt(row.original.total_margin_paid)}</Span>,
  },
  {
    Header: "Total Value",
    accessor: "total_value",
    minWidth: 150,
    Cell: ({ row }: any) => <Span>{fmt(row.original.total_value)}</Span>,
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span>{formatDateToDDMMYYYY(row.original.created_at)}</Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

// ─── Deposit Columns ─────────────────────────────────────────────────────────
export const DepositColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Typography color="success.main" variant="body2" fontWeight="bold">
        {fmt(row.original.amount)}
      </Typography>
    ),
  },
  {
    Header: "Deposit Date",
    accessor: "deposit_date",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span>{formatDateToDDMMYYYY(row.original.deposit_date)}</Span>
    ),
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
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

// ─── Withdrawal Columns ──────────────────────────────────────────────────────
export const WithdrawalColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Typography color="error.main" variant="body2" fontWeight="bold">
        - {fmt(row.original.amount)}
      </Typography>
    ),
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const s = row.original.status;
      const color = s === "approved" ? "success" : s === "rejected" ? "error" : "warning";
      return <Chip label={s.toUpperCase()} color={color} size="small" />;
    },
  },
  {
    Header: "Withdrawal Date",
    accessor: "withdrawal_date",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span>{formatDateToDDMMYYYY(row.original.withdrawal_date)}</Span>
    ),
  },
  {
    Header: "Approved By",
    accessor: "approved_by",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const ab = row.original.approved_by;
      return (
        <Span>{ab ? `${ab.first_name} ${ab.last_name}` : "N/A"}</Span>
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      const filtered = data.status === "pending" ? actions : [];
      return <DropdownActionBtn key={row.id} actions={filtered} metaData={data} />;
    },
  },
];

// ─── Profit Agreement Columns — UPDATED: payout_type + interest fields ───────
export const ProfitAgreementColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor Name",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    },
  },
  {
    Header: "Type",
    accessor: "payout_type",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const t = row.original.payout_type;
      if (t === "interest") {
        return (
          <Chip
            label={`Interest ${row.original.fixed_interest_rate || 0}%`}
            size="small" color="info" variant="outlined"
          />
        );
      }
      return <Chip label="Margin" size="small" color="default" variant="outlined" />;
    },
  },
  {
    Header: "Threshold",
    accessor: "profit_threshold",
    minWidth: 110,
    Cell: ({ row }: any) => {
      if (row.original.payout_type === "interest") return <Span>—</Span>;
      return <Span>{row.original.profit_threshold}%</Span>;
    },
  },
  {
    Header: "Investor Share",
    accessor: "investor_share",
    minWidth: 120,
    Cell: ({ row }: any) => {
      if (row.original.payout_type === "interest") return <Span>—</Span>;
      return (
        <Typography color="success.main" variant="body2" fontWeight="bold">
          {row.original.investor_share}%
        </Typography>
      );
    },
  },
  {
    Header: "BENNU Share",
    accessor: "bennu_share",
    minWidth: 110,
    Cell: ({ row }: any) => {
      if (row.original.payout_type === "interest") return <Span>—</Span>;
      return (
        <Typography color="info.main" variant="body2" fontWeight="bold">
          {row.original.bennu_share}%
        </Typography>
      );
    },
  },
  {
    Header: "Interest Rate",
    accessor: "fixed_interest_rate",
    minWidth: 110,
    Cell: ({ row }: any) => {
      if (row.original.payout_type !== "interest") return <Span>—</Span>;
      return (
        <Typography color="warning.main" variant="body2" fontWeight="bold">
          {row.original.fixed_interest_rate}%
        </Typography>
      );
    },
  },
  {
    Header: "Period",
    accessor: "interest_period_days",
    minWidth: 80,
    Cell: ({ row }: any) => {
      if (row.original.payout_type !== "interest") return <Span>—</Span>;
      return <Span>{row.original.interest_period_days}d</Span>;
    },
  },
  {
    Header: "Effective Date",
    accessor: "effective_date",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span>{formatDateToDDMMYYYY(row.original.effective_date)}</Span>
    ),
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
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

// ─── Margin Payout Columns (NEW – backend change #2) ─────────────────────────
const PAYOUT_STATUS_COLOR: Record<string, any> = {
  pending: "warning",
  approved: "info",
  paid: "success",
  cancelled: "error",
};

export const MarginPayoutColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Investor",
    accessor: "investor.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investor } = row.original;
      return <Span>{`${investor.first_name} ${investor.last_name}`}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 160,
    Cell: ({ row }: any) => (
      <Typography color="success.main" variant="body2" fontWeight="bold">
        {fmt(row.original.amount)}
      </Typography>
    ),
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const s: string = row.original.status;
      return (
        <Chip
          label={s.toUpperCase()}
          color={PAYOUT_STATUS_COLOR[s] ?? "default"}
          size="small"
        />
      );
    },
  },
  {
    Header: "Approved By",
    accessor: "approved_by",
    minWidth: 160,
    Cell: ({ row }: any) => {
      const ab = row.original.approved_by;
      return <Span>{ab ? `${ab.first_name} ${ab.last_name}` : "—"}</Span>;
    },
  },
  {
    Header: "Approved At",
    accessor: "approved_at",
    minWidth: 130,
    Cell: ({ row }: any) =>
      row.original.approved_at ? (
        <Span>{formatDateToDDMMYYYY(row.original.approved_at)}</Span>
      ) : (
        <Span>—</Span>
      ),
  },
  {
    Header: "Paid At",
    accessor: "paid_at",
    minWidth: 130,
    Cell: ({ row }: any) =>
      row.original.paid_at ? (
        <Span>{formatDateToDDMMYYYY(row.original.paid_at)}</Span>
      ) : (
        <Span>—</Span>
      ),
  },
  {
    Header: "Notes",
    accessor: "notes",
    minWidth: 180,
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span>{formatDateToDDMMYYYY(row.original.created_at)}</Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      // Only show relevant actions per status
      const filtered = actions.filter((a) => {
        if (a.label === "Approve" && data.status !== "pending") return false;
        if (a.label === "Mark Paid" && data.status !== "approved") return false;
        if (a.label === "Cancel" && !["pending", "approved"].includes(data.status)) return false;
        return true;
      });
      return <DropdownActionBtn key={row.id} actions={filtered} metaData={data} />;
    },
  },
];

export default InvestorAccountColumnShape;