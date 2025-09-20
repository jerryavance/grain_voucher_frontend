import { Button } from "@mui/material";
import {
  TRANSACTION_STATUS_COMPLETED,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_STATUS_FAILED,
  TRANSACTION_STATUS_CANCELLED,
  TYPE_INVESTOR,
  TYPE_ADMIN,
} from "../../api/constants";
import Visibility from "../../components/UI/Visibility";
import useAuth from "../../hooks/useAuth";
import { beautifyName } from "../../utils/helpers";
import { IParticipants } from "../Investments/InvestmentParticipants/Participants.interface";
import { IInvestment } from "../Investments/InvestmentsList/Investment.interface";
import { ITransaction } from "./Transactions.interface";
import { Cancel, Check } from "@mui/icons-material";
import { Small } from "../../components/Typography";
import { StatusTag } from "../../components/elements/Elements";
import { Header } from "antd/es/layout/layout";
import { Span } from "../../components/Typography";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

export const TransactionColumnShape = (options?: any) => {
  const {
    investmentDetails,
    handleAction,
  }: { investmentDetails: IInvestment; handleAction: any } = options;
  const { participant_details }: { participant_details: IParticipants } =
    investmentDetails || {};

  const { user } = useAuth();

  const TransactionActions = ({ transaction }: { transaction: ITransaction }) => {
    // Check if user is the transaction creator
    const isCreator = transaction.created_by?.id === user?.id;
    
    // Check if user has admin privileges (TAB_MASTER or INVESTOR)
    const hasAdminPrivileges = [TYPE_ADMIN, TYPE_INVESTOR].includes(
      participant_details?.type
    );

    return (
      <div style={{ textWrap: "nowrap" }}>
        {/* Cancel - Only transaction creator can cancel a pending transaction */}
        <Visibility
          visible={
            transaction.status === TRANSACTION_STATUS_PENDING && 
            isCreator
          }
        >
          <Button
            className="btn-orange"
            onClick={() => handleAction(transaction, TRANSACTION_STATUS_CANCELLED)}
          >
            <Cancel sx={{ fontSize: 14 }} />
            <Small fontWeight={500}>Cancel</Small>
          </Button>
        </Visibility>

        {/* Reject - Admin users can reject pending transactions */}
        <Visibility
          visible={
            transaction.status === TRANSACTION_STATUS_PENDING && 
            hasAdminPrivileges && 
            !isCreator
          }
        >
          <Button
            className="btn-danger"
            onClick={() => handleAction(transaction, TRANSACTION_STATUS_FAILED)}
          >
            <Cancel sx={{ fontSize: 14 }} />
            <Small fontWeight={500}>Reject</Small>
          </Button>
        </Visibility>

        {/* Approve - Admin users can approve pending transactions */}
        <Visibility
          visible={
            transaction.status === TRANSACTION_STATUS_PENDING && 
            hasAdminPrivileges && 
            !isCreator
          }
        >
          <Button
            className="btn-green"
            onClick={() => handleAction(transaction, TRANSACTION_STATUS_COMPLETED)}
          >
            <Check sx={{ fontSize: 14 }} />
            <Small fontWeight={500}>Approve</Small>
          </Button>
        </Visibility>

        {/* Revoke - Admin users can revoke completed transactions */}
        <Visibility
          visible={
            transaction.status === TRANSACTION_STATUS_COMPLETED && 
            hasAdminPrivileges
          }
        >
          <Button
            className="btn-orange"
            onClick={() => handleAction(transaction, TRANSACTION_STATUS_FAILED)}
          >
            <Cancel sx={{ fontSize: 14 }} />
            <Small fontWeight={500}>Revoke</Small>
          </Button>
        </Visibility>
        
        {/* No actions for FAILED or CANCELLED transactions */}
        <Visibility
          visible={
            transaction.status === TRANSACTION_STATUS_FAILED || 
            transaction.status === TRANSACTION_STATUS_CANCELLED
          }
        >
          <Small fontWeight={400} color="text.secondary">No actions available</Small>
        </Visibility>
      </div>
    );
  };

  return [
    {
      Header: "Raised By",
      accessor: "wallet.wallet_number", // optional, but overridden by Cell anyway
      minWidth: 200,
      Cell: ({ row }: any) => {
        const { wallet } = row.original;
        // return beautifyName(iotech_data.payerName);
        return <Span sx={{ fontSize: 12 }}>{wallet?.wallet_number || "N/A"}</Span>
      },
    },
    {
      Header: "Amount",
      minWidth: 100,
      accessor: "amount",
    },
    {
      Header: "Reference",
      minWidth: 100,
      accessor: "reference_number",
    },
    {
      Header: "Date",
      accessor: "transaction_date",
      minWidth: 100,
      Cell: ({ row }: any) => formatDateToDDMMYYYY(row.original.transaction_date)
    },
    {
      Header: "Type",
      minWidth: 100,
      accessor: "transaction_type",
    },
    {
      Header: "Description",
      minWidth: 200,
      accessor: "description",
    },
    {
      Header: "Status",
      minWidth: 100,
      accessor: "status",
      Cell: ({ row }: any) => {
        const { status } = row.original;
        return <StatusTag status={status} />;
      },
    },
    {
      Header: "Action",
      minWidth: 100,
      Cell: ({ row }: any) => {
        const { original: transaction } = row;
        return <TransactionActions transaction={transaction} />;
      },
    },
  ];
};