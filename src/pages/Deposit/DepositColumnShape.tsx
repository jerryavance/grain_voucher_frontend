import { FC } from "react";
import { Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { getDepositStatusColor } from "../../utils/helpers";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const styledTypography = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
    fontWeight: 'bold'
  }
}

export const DepositDetailsLink: FC<{ id: string, grnNumber?: string }> = ({ id, grnNumber }) => {
  const navigate = useNavigate();
  const displayText = grnNumber || `DEP-${id.slice(-8)}`;
  
  return (
    <Typography 
      sx={styledTypography} 
      color='primary' 
      variant='h6' 
      onClick={() => navigate(`/admin/deposits/details/${id}`)}
    >
      {displayText}
    </Typography>
  );
}

const DepositColumnShape = (actions: IDropdownAction[], id: string) => [
// const DepositColumnShape = (ViewAction: FC<{ id: string }>) => [
  {
    Header: "GRN Number",
    accessor: "grn_number",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { grn_number, id } = row.original;
      return <DepositDetailsLink id={id} grnNumber={grn_number} />;
    }
  },
  {
    Header: "Farmer",
    accessor: "farmer",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { farmer } = row.original;
      const farmerName = typeof farmer === 'object' ? farmer.name : farmer;
      return <Typography variant="body1">{farmerName || "N/A"}</Typography>;
    }
  },
  {
    Header: "Hub",
    accessor: "hub",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      const hubName = typeof hub === 'object' ? hub.name : hub;
      return <Typography variant="body1">{hubName || "N/A"}</Typography>;
    }
  },
  {
    Header: "Grain Type",
    accessor: "grain_type",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { grain_type } = row.original;
      const grainTypeName = typeof grain_type === 'object' ? grain_type.name : grain_type;
      return <Typography variant="body1">{grainTypeName || "N/A"}</Typography>;
    }
  },
  {
    Header: "Quantity (KG)",
    accessor: "quantity_kg",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { quantity_kg } = row.original;
      return <Typography variant="body1">{quantity_kg ? `${Number(quantity_kg).toLocaleString()} kg` : "N/A"}</Typography>;
    }
  },
  {
    Header: "Quality Grade",
    accessor: "quality_grade",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { quality_grade } = row.original;
      const gradeName = typeof quality_grade === 'object' ? quality_grade.name : quality_grade;
      return <Typography variant="body1">{gradeName || "N/A"}</Typography>;
    }
  },
  {
    Header: "Moisture Level",
    accessor: "moisture_level",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { moisture_level } = row.original;
      return <Typography variant="body1">{moisture_level ? `${moisture_level}%` : "N/A"}</Typography>;
    }
  },
  {
    Header: "Deposit Date",
    accessor: "deposit_date",
    minWidth: 120,
    Cell: ({ row }: any) => formatDateToDDMMYYYY(row.original.deposit_date)
  },
  {
    Header: "Agent",
    accessor: "agent",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { agent } = row.original;
      if (!agent) return <Typography variant="body1" color="text.secondary">No Agent</Typography>;
      
      const agentName = typeof agent === 'object' ? agent.name : agent;
      return <Typography variant="body1">{agentName}</Typography>;
    }
  },
  {
    Header: "Calculated Value",
    accessor: "calculated_value",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { calculated_value } = row.original;
      return (
        <Typography variant="body1" fontWeight="medium">
          {calculated_value ? `$${Number(calculated_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Validation Status",
    accessor: "validated",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { validated } = row.original;
      
      return (
        <Chip
          label={validated ? "Validated" : "Pending"}
          size="small"
          color={validated ? "success" : "warning"}
          variant={validated ? "filled" : "outlined"}
        />
      );
    }
  },
  {
    Header: "Notes",
    accessor: "notes",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { notes } = row.original;
      if (!notes) return <Typography variant="body2" color="text.secondary">No notes</Typography>;
      
      const truncatedNotes = notes.length > 50 ? `${notes.substring(0, 47)}...` : notes;
      return (
        <Typography 
          variant="body2" 
          title={notes}
          sx={{ cursor: notes.length > 50 ? 'help' : 'default' }}
        >
          {truncatedNotes}
        </Typography>
      );
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 50,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export default DepositColumnShape;