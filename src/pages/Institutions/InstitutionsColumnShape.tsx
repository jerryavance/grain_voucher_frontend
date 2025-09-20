import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { useNavigate } from "react-router-dom";

const InstitutionsColumnShape = (actions: IDropdownAction[]) => {
  const navigate = useNavigate();

  return [
    {
      Header: "Logo",
      accessor: "logo",
      minWidth: 80,
      Cell: ({ row }: any) => {
        const { logo, name } = row.original;
        return logo ? (
          <img
            src={logo}
            alt={`${name} logo`}
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        ) : (
          <Span sx={{ fontSize: 12, color: "text.secondary" }}>No Logo</Span>
        );
      }
    },
    {
      Header: "ID",
      accessor: "id",
      minWidth: 250,
      Cell: ({ row }: any) => {
        const { id } = row.original;
        return (
          <Span
            sx={{
              fontSize: 12,
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() => navigate(`/institutions/${id}`)}
          >
            {id}
          </Span>
        );
      }
    },
    {
      Header: "Name",
      accessor: "name",
      minWidth: 200,
      Cell: ({ row }: any) => {
        const { name } = row.original;
        return (
          <Span sx={{ fontSize: 12, fontWeight: "bold" }}>
            {name}
          </Span>
        );
      }
    },
    {
      Header: "Type",
      accessor: "type",
      minWidth: 100,
    },
    {
      Header: "Description",
      accessor: "description",
      minWidth: 250,
      Cell: ({ row }: any) => {
        const { description } = row.original;
        return (
          <Span sx={{ fontSize: 12 }}>
            {description || "N/A"}
          </Span>
        );
      }
    },
    {
      Header: "Rating",
      accessor: "rating",
      minWidth: 80,
    },
    {
      Header: "Total Funds Managed",
      accessor: "total_funds_managed",
      minWidth: 150,
    },
    {
      Header: "Active Products",
      accessor: "active_products_count",
      minWidth: 120,
    },
    {
      Header: "Total Investors",
      accessor: "total_investors",
      minWidth: 120,
    },
    {
      Header: "Location",
      accessor: "location",
      minWidth: 200,
    },
    {
      Header: "Established Year",
      accessor: "established_year",
      minWidth: 120,
    },
    {
      Header: "Verified",
      accessor: "verified",
      minWidth: 80,
      Cell: ({ row }: any) => {
        const { verified } = row.original;
        return <Span sx={{ fontSize: 12 }}>{verified ? "Yes" : "No"}</Span>;
      }
    },
    {
      Header: "Created At",
      accessor: "created_at",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const { created_at } = row.original;
        return (
          <Span sx={{ fontSize: 12 }}>
            {new Date(created_at).toLocaleDateString()}
          </Span>
        );
      }
    },
    {
      Header: "Updated At",
      accessor: "updated_at",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const { updated_at } = row.original;
        return (
          <Span sx={{ fontSize: 12 }}>
            {new Date(updated_at).toLocaleDateString()}
          </Span>
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
        return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
      }
    },
  ];
};

export default InstitutionsColumnShape;
