import { FC } from "react";
import { Typography, Chip } from "@mui/material";
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

// Invoice Column Shape
export const InvoiceColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Invoice ID",
    accessor: "id",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { id } = row.original;
      return (
        <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id.slice(0, 8)}...
        </Typography>
      );
    }
  },
  {
    Header: "Account",
    accessor: "account.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { account } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {account?.name || "Unknown Account"}
        </Span>
      );
    }
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { amount } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: 'bold' }}>
          ${parseFloat(amount).toLocaleString()}
        </Span>
      );
    }
  },
  {
    Header: "Due Date",
    accessor: "due_date",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { due_date } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(due_date)}
        </Span>
      );
    }
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { status } = row.original;
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'paid': return 'success';
          case 'sent': return 'primary';
          case 'overdue': return 'error';
          case 'draft': return 'default';
          default: return 'default';
        }
      };
      return (
        <Chip 
          label={status.toUpperCase()} 
          color={getStatusColor(status) as any}
          size="small"
          sx={{ fontSize: 10 }}
        />
      );
    }
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(created_at)}
        </Span>
      );
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

// Journal Entry Column Shape
export const JournalEntryColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Entry ID",
    accessor: "id",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { id } = row.original;
      return (
        <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id.slice(0, 8)}...
        </Typography>
      );
    }
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { description } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {description.length > 50 ? `${description.slice(0, 50)}...` : description}
        </Span>
      );
    }
  },
  {
    Header: "Debit Account",
    accessor: "debit_account",
    minWidth: 120,
  },
  {
    Header: "Credit Account",
    accessor: "credit_account",
    minWidth: 120,
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { amount } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: 'bold' }}>
          ${parseFloat(amount).toLocaleString()}
        </Span>
      );
    }
  },
  {
    Header: "Date",
    accessor: "date",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { date } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(date)}
        </Span>
      );
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

// Budget Column Shape
export const BudgetColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Budget ID",
    accessor: "id",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { id } = row.original;
      return (
        <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id.slice(0, 8)}...
        </Typography>
      );
    }
  },
  {
    Header: "Period",
    accessor: "period",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { period } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(period)}
        </Span>
      );
    }
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {hub?.name || "All Hubs"}
        </Span>
      );
    }
  },
  {
    Header: "Grain Type",
    accessor: "grain_type.name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { grain_type } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {grain_type?.name || "All Types"}
        </Span>
      );
    }
  },
  {
    Header: "Budgeted Amount",
    accessor: "budgeted_amount",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { budgeted_amount } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: 'bold', color: 'primary.main' }}>
          ${parseFloat(budgeted_amount).toLocaleString()}
        </Span>
      );
    }
  },
  {
    Header: "Actual Amount",
    accessor: "actual_amount",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { actual_amount } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: 'bold' }}>
          ${parseFloat(actual_amount).toLocaleString()}
        </Span>
      );
    }
  },
  {
    Header: "Variance",
    accessor: "variance",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { variance } = row.original;
      const varianceValue = parseFloat(variance);
      const isPositive = varianceValue >= 0;
      return (
        <Span sx={{ 
          fontSize: 12, 
          fontWeight: 'bold',
          color: isPositive ? 'success.main' : 'error.main'
        }}>
          {isPositive ? '+' : ''}${varianceValue.toLocaleString()}
        </Span>
      );
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