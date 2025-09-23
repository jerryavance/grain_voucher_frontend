import React from "react";
import { 
  CheckCircle, 
  Cancel, 
  Visibility,
  Phone,
  Grain,
  Person,
  AssignmentTurnedIn,
  AssignmentLate,
  MonetizationOn
} from "@mui/icons-material";
import FlexBox from "../../components/FlexBox";
import { H6, Tiny } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import UkoAvatar from "../../components/UkoAvatar";
import { 
  capitalizeFirstLetter 
} from "../../utils/helpers";
import { IDeposit } from "./Deposit.interface";

interface DepositColumnShapeProps {
  handleDepositAction: (deposit: IDeposit, action: string) => void;
  isHubAdmin?: boolean;
  isMobile?: boolean;
}

const DepositColumnShape = (options: DepositColumnShapeProps) => {
  const { handleDepositAction, isHubAdmin, isMobile } = options;

  const tableActions = (deposit: IDeposit): IDropdownAction[] => {
    if (!isHubAdmin) return [];

    const actions: IDropdownAction[] = [];

    console.log('Deposit data for actions:', {
      id: deposit.id,
      validated: deposit.validated,
      voucher: deposit.voucher,
      agent: deposit.agent
    });

    // Deposit validation actions - show for non-validated deposits
    if (!deposit.validated) {
      actions.push(
        {
          label: "Validate Deposit",
          icon: <CheckCircle color="success" />,
          onClick: (deposit: IDeposit) => handleDepositAction(deposit, "validate"),
        },
        {
          label: "Reject Deposit", 
          icon: <Cancel color="error" />,
          onClick: (deposit: IDeposit) => handleDepositAction(deposit, "reject"),
        }
      );
    }

    // Voucher verification actions (only for validated deposits with vouchers)
    if (deposit.validated && deposit.voucher) {
      if (deposit.voucher.verification_status === "pending") {
        actions.push(
          {
            label: "Verify Voucher",
            icon: <AssignmentTurnedIn color="success" />,
            onClick: (deposit: IDeposit) => handleDepositAction(deposit, "verify_voucher"),
          },
          {
            label: "Reject Voucher",
            icon: <AssignmentLate color="error" />,
            onClick: (deposit: IDeposit) => handleDepositAction(deposit, "reject_voucher"),
          }
        );
      }
    }

    // For validated deposits without vouchers, show option to generate voucher (if applicable)
    if (deposit.validated && !deposit.voucher) {
      actions.push({
        label: "Generate Voucher",
        icon: <AssignmentTurnedIn color="primary" />,
        onClick: (deposit: IDeposit) => handleDepositAction(deposit, "generate_voucher"),
      });
    }

    // Always show view details
    actions.push({
      label: "View Details",
      icon: <Visibility />,
      onClick: (deposit: IDeposit) => handleDepositAction(deposit, "view_details"),
    });

    console.log('Generated actions:', actions.length, actions.map(a => a.label));
    return actions;
  };

  const getDepositStatusColor = (validated: boolean) => {
    return validated ? '#4caf50' : '#ff9800';
  };

  const getVoucherStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    if (isMobile) {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: string) => {
    return `UGX ${parseFloat(value).toLocaleString()}`;
  };

  const columns: any[] = [
    {
      Header: "Farmer",
      accessor: (row: IDeposit) => row.farmer.name,
      minWidth: isMobile ? 200 : 250,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const { farmer } = deposit;

        return (
          <FlexBox alignItems="center">
            <UkoAvatar 
              src="/static/avatar/001-man.svg" 
              sx={{ 
                width: isMobile ? 32 : 35, 
                height: isMobile ? 32 : 35 
              }} 
            />
            <FlexBox flexDirection="column" ml={isMobile ? 1.5 : 2}>
              <H6 
                className="mainColor semiBold"
                sx={{ 
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  lineHeight: 1.2 
                }}
              >
                {farmer.name}
              </H6>
              <FlexBox alignItems="center">
                <Phone sx={{ 
                  fontSize: isMobile ? 10 : 12, 
                  mr: 0.5, 
                  color: '#666' 
                }} />
                <Tiny 
                  color="text.disabled"
                  sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                >
                  {isMobile ? 
                    farmer.phone_number.replace('+256', '0') : 
                    farmer.phone_number
                  }
                </Tiny>
              </FlexBox>
            </FlexBox>
          </FlexBox>
        );
      },
    },
    {
      Header: "Agent",
      accessor: (row: IDeposit) => row.agent?.name || 'N/A',
      minWidth: isMobile ? 120 : 150,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const { agent } = deposit;

        if (!agent) {
          return <Tiny color="text.disabled">Direct</Tiny>;
        }

        return (
          <FlexBox alignItems="center">
            <Person sx={{ 
              fontSize: isMobile ? 12 : 14, 
              mr: 0.5, 
              color: '#666' 
            }} />
            <FlexBox flexDirection="column">
              <Tiny 
                sx={{ 
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 500
                }}
              >
                {agent.name}
              </Tiny>
              {!isMobile && (
                <Tiny color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                  {agent.phone_number}
                </Tiny>
              )}
            </FlexBox>
          </FlexBox>
        );
      },
    },
    {
      Header: "Grain & Quality",
      accessor: (row: IDeposit) => row.grain_type_details.name,
      minWidth: isMobile ? 140 : 180,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const { grain_type_details, quality_grade_details, moisture_level } = deposit;

        return (
          <FlexBox alignItems="center">
            <Grain sx={{ 
              fontSize: isMobile ? 12 : 14, 
              mr: 0.5, 
              color: '#4caf50' 
            }} />
            <FlexBox flexDirection="column">
              <Tiny 
                sx={{ 
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 500
                }}
              >
                {grain_type_details.name}
              </Tiny>
              <Tiny color="text.disabled" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                {quality_grade_details.name} ({moisture_level}% moisture)
              </Tiny>
            </FlexBox>
          </FlexBox>
        );
      },
    },
    {
      Header: "Quantity & Value",
      accessor: (row: IDeposit) => row.quantity_kg,
      minWidth: isMobile ? 120 : 150,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const { quantity_kg, value, grn_number } = deposit;

        return (
          <FlexBox flexDirection="column">
            <FlexBox alignItems="center" mb={0.5}>
              <MonetizationOn sx={{ 
                fontSize: isMobile ? 12 : 14, 
                mr: 0.5, 
                color: '#ff9800' 
              }} />
              <Tiny 
                sx={{ 
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600
                }}
              >
                {parseFloat(quantity_kg).toLocaleString()} kg
              </Tiny>
            </FlexBox>
            <Tiny color="text.disabled" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
              {formatCurrency(value)}
            </Tiny>
            {grn_number && (
              <Tiny color="text.disabled" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                GRN: {grn_number}
              </Tiny>
            )}
          </FlexBox>
        );
      },
    },
    {
      Header: "Status",
      accessor: (row: IDeposit) => row.validated,
      minWidth: isMobile ? 120 : 140,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const { validated, voucher, deposit_date } = deposit;

        return (
          <FlexBox flexDirection="column" gap={0.5}>
            {/* Deposit Status */}
            <span
              style={{
                padding: isMobile ? "3px 6px" : "4px 8px",
                borderRadius: "4px",
                fontSize: isMobile ? "0.65rem" : "0.75rem",
                fontWeight: 600,
                color: 'white',
                backgroundColor: getDepositStatusColor(validated),
                textAlign: 'center',
                display: 'inline-block',
                minWidth: isMobile ? '60px' : '70px'
              }}
            >
              {validated ? 'Validated' : 'Pending'}
            </span>
            
            {/* Voucher Status */}
            {voucher && (
              <span
                style={{
                  padding: isMobile ? "2px 4px" : "3px 6px",
                  borderRadius: "3px",
                  fontSize: isMobile ? "0.6rem" : "0.7rem",
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: getVoucherStatusColor(voucher.verification_status),
                  textAlign: 'center',
                  display: 'inline-block',
                  minWidth: isMobile ? '55px' : '65px'
                }}
              >
                V: {capitalizeFirstLetter(voucher.verification_status)}
              </span>
            )}
            
            {/* Date */}
            {!isMobile && (
              <Tiny color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {formatDate(deposit_date)}
              </Tiny>
            )}
          </FlexBox>
        );
      },
    }
  ];

  // Add notes column for larger screens
  if (!isMobile) {
    columns.push({
      Header: "Notes",
      accessor: (row: IDeposit) => row.notes,
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Tiny 
          sx={{ 
            maxWidth: 140, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem'
          }}
          title={value} // Show full text on hover
        >
          {value || "No notes"}
        </Tiny>
      ),
    });
  }

  // Only Hub admin sees Action column
  if (isHubAdmin) {
    columns.push({
      Header: "Actions",
      accessor: "id",
      minWidth: isMobile ? 80 : 100,
      maxWidth: isMobile ? 80 : 120,
      Cell: ({ row }: any) => {
        const deposit = row.original as IDeposit;
        const actions = tableActions(deposit);

        if (actions.length === 0) return <Tiny>-</Tiny>;

        return (
          <DropdownActionBtn
            key={deposit.id}
            actions={actions}
            metaData={deposit}
          />
        );
      },
    });
  }

  return columns;
};

export default DepositColumnShape;