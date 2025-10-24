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
  {
    Header: "Farmer",
    accessor: "farmer",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { farmer } = row.original;
      if (!farmer) return <Typography color="text.primary">Unknown</Typography>;

      const name = `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim();
      return (
        <Typography variant="body1">
          {name || "N/A"} <br />
          <Typography variant="body2" color="text.primary">
            {farmer.phone_number}
          </Typography>
        </Typography>
      );
    }
  },
  {
    Header: "Hub",
    accessor: "hub",
    minWidth: 160,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      if (!hub) return "N/A";
      return (
        <Typography variant="body1">
          {hub.name} <br />
          <Typography variant="body2" color="text.primary">
            {hub.location || "—"}
          </Typography>
        </Typography>
      );
    }
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_details",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { grain_type_details } = row.original;
      return (
        <Typography variant="body1">
          {grain_type_details?.name || "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Quality Grade",
    accessor: "quality_grade_details",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { quality_grade_details } = row.original;
      return (
        <Typography variant="body1">
          {quality_grade_details?.name || "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Quantity (KG)",
    accessor: "quantity_kg",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { quantity_kg } = row.original;
      return (
        <Typography variant="body1">
          {quantity_kg
            ? `${Number(quantity_kg).toLocaleString()} kg`
            : "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Value (UGX)",
    accessor: "value",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const { value } = row.original;
      return (
        <Typography variant="body1" fontWeight="medium">
          {value
            ? `${Number(value).toLocaleString("en-UG", {
                minimumFractionDigits: 0,
              })}`
            : "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Moisture Level",
    accessor: "moisture_level",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { moisture_level } = row.original;
      return (
        <Typography variant="body1">
          {moisture_level ? `${moisture_level}%` : "N/A"}
        </Typography>
      );
    }
  },
  {
    Header: "Deposit Date",
    accessor: "deposit_date",
    minWidth: 120,
    Cell: ({ row }: any) =>
      formatDateToDDMMYYYY(row.original.deposit_date)
  },
  {
    Header: "Validation Status",
    accessor: "validated",
    minWidth: 120,
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
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { notes } = row.original;
      if (!notes)
        return (
          <Typography variant="body2" color="text.primary">
            No notes
          </Typography>
        );

      const truncated =
        notes.length > 50 ? `${notes.slice(0, 47)}...` : notes;

      return (
        <Typography
          variant="body2"
          title={notes}
          sx={{ cursor: notes.length > 50 ? "help" : "default" }}
        >
          {truncated}
        </Typography>
      );
    }
  },
  {
    Header: "GRN Number",
    accessor: "grn_number",
    minWidth: 250,
    Cell: ({ row }: any) => {
      const { grn_number, id } = row.original;
      return <DepositDetailsLink id={id} grnNumber={grn_number} />;
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 60,
    maxWidth: 60,
    Cell: ({ row }: any) => {
      const data = row.original;
      return (
        <DropdownActionBtn key={row.id} actions={actions} metaData={data} />
      );
    }
  }
];


export default DepositColumnShape;