// CRMColumnShapes.tsx
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

// Lead Column Shape
export const LeadColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (
        <Typography sx={styledTypography} color="primary" variant="h6">
          {name}
        </Typography>
      );
    },
  },
  {
    Header: "Phone",
    accessor: "phone",
    minWidth: 130,
  },
  {
    Header: "Email",
    accessor: "email",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { email } = row.original;
      return <Span sx={{ fontSize: 12 }}>{email || "N/A"}</Span>;
    },
  },
  {
    Header: "Source",
    accessor: "source",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { source } = row.original;
      return <Span sx={{ fontSize: 12, textTransform: 'capitalize' }}>{source}</Span>;
    },
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { status } = row.original;
      const getColor = () => {
        switch (status) {
          case 'new': return 'primary';
          case 'qualified': return 'success';
          case 'lost': return 'error';
          default: return 'default';
        }
      };
      return (
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          color={getColor()} 
          size="small" 
        />
      );
    },
  },
  {
    Header: "Assigned To",
    accessor: "assigned_to",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { assigned_to } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {assigned_to ? `${assigned_to.first_name} ${assigned_to.last_name}` : "Unassigned"}
        </Span>
      );
    },
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(created_at)}</Span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

// Account Column Shape
export const AccountColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (
        <Typography sx={styledTypography} color="primary" variant="h6">
          {name}
        </Typography>
      );
    },
  },
  {
    Header: "Type",
    accessor: "type",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { type } = row.original;
      const getColor = () => {
        switch (type) {
          case 'customer': return 'success';
          case 'supplier': return 'warning';
          case 'investor': return 'info';
          default: return 'default';
        }
      };
      return (
        <Chip 
          label={type.charAt(0).toUpperCase() + type.slice(1)} 
          color={getColor()} 
          size="small" 
        />
      );
    },
  },
  {
    Header: "Credit Terms",
    accessor: "credit_terms_days",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { credit_terms_days } = row.original;
      return <Span sx={{ fontSize: 12 }}>{credit_terms_days} days</Span>;
    },
  },
  {
    Header: "Hub",
    accessor: "hub",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {hub?.name || "No Hub"}
        </Span>
      );
    },
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(created_at)}</Span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

// Contact Column Shape
export const ContactColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (
        <Typography sx={styledTypography} color="primary" variant="h6">
          {name}
        </Typography>
      );
    },
  },
  {
    Header: "Phone",
    accessor: "phone",
    minWidth: 130,
  },
  {
    Header: "Email",
    accessor: "email",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { email } = row.original;
      return <Span sx={{ fontSize: 12 }}>{email || "N/A"}</Span>;
    },
  },
  {
    Header: "Role",
    accessor: "role",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { role } = row.original;
      return <Span sx={{ fontSize: 12 }}>{role || "N/A"}</Span>;
    },
  },
  {
    Header: "Account",
    accessor: "account",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { account } = row.original;
      return <Span sx={{ fontSize: 12 }}>{account?.name}</Span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

// Opportunity Column Shape
export const OpportunityColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (
        <Typography sx={styledTypography} color="primary" variant="h6">
          {name}
        </Typography>
      );
    },
  },
  {
    Header: "Account",
    accessor: "account",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { account } = row.original;
      return <Span sx={{ fontSize: 12 }}>{account?.name}</Span>;
    },
  },
  {
    Header: "Volume (MT)",
    accessor: "expected_volume_mt",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { expected_volume_mt } = row.original;
      return <Span sx={{ fontSize: 12 }}>{expected_volume_mt.toLocaleString()}</Span>;
    },
  },
  {
    Header: "Price/MT",
    accessor: "expected_price_per_mt",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { expected_price_per_mt } = row.original;
      return <Span sx={{ fontSize: 12 }}>${expected_price_per_mt.toLocaleString()}</Span>;
    },
  },
  {
    Header: "Stage",
    accessor: "stage",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { stage } = row.original;
      const getColor = () => {
        switch (stage) {
          case 'prospect': return 'primary';
          case 'quote': return 'warning';
          case 'won': return 'success';
          case 'lost': return 'error';
          default: return 'default';
        }
      };
      return (
        <Chip 
          label={stage.charAt(0).toUpperCase() + stage.slice(1)} 
          color={getColor()} 
          size="small" 
        />
      );
    },
  },
  {
    Header: "Assigned To",
    accessor: "assigned_to",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { assigned_to } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {assigned_to ? `${assigned_to.first_name} ${assigned_to.last_name}` : "Unassigned"}
        </Span>
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
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

// Contract Column Shape
export const ContractColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Opportunity",
    accessor: "opportunity",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { opportunity } = row.original;
      return (
        <Typography sx={styledTypography} color="primary" variant="h6">
          {opportunity?.name}
        </Typography>
      );
    },
  },
  {
    Header: "Account",
    accessor: "opportunity.account",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { opportunity } = row.original;
      return <Span sx={{ fontSize: 12 }}>{opportunity?.account?.name}</Span>;
    },
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { status } = row.original;
      const getColor = () => {
        switch (status) {
          case 'draft': return 'primary';
          case 'signed': return 'warning';
          case 'executed': return 'success';
          default: return 'default';
        }
      };
      return (
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          color={getColor()} 
          size="small" 
        />
      );
    },
  },
  {
    Header: "Signed Date",
    accessor: "signed_at",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { signed_at } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {signed_at ? formatDateToDDMMYYYY(signed_at) : "Not signed"}
        </Span>
      );
    },
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(created_at)}</Span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];