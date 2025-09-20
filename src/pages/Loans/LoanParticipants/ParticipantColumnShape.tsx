import React from "react";
import { Cancel, ChangeCircle } from "@mui/icons-material";
import FlexBox from "../../../components/FlexBox";
import { H6, Tiny } from "../../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import UkoAvatar from "../../../components/UkoAvatar";
import { beautifyName, capitalizeFirstLetter, getStatusClass } from "../../../utils/helpers";
import { IParticipants } from "./Participants.interface";
import { LOAN_STATUS_ACTIVE, LOAN_STATUS_PENDING } from "../../../constants/loan-options";
import { CanChangeParticipantRole } from "../../../utils/permissions";

const ParticipantsColumnShape = (options?: any) => {
  const { handleParticipantStatus, loanDetails, handleChangeRole } = options;

  const tableActions = (participant: IParticipants): IDropdownAction[] => {
    return [
      ...([LOAN_STATUS_PENDING, LOAN_STATUS_ACTIVE].includes(loanDetails?.status) &&
      CanChangeParticipantRole(loanDetails)
        ? [
            {
              label: "Change Role",
              icon: <ChangeCircle color="error" />,
              onClick: (Participant: IParticipants) => handleChangeRole(Participant),
            },
          ]
        : []),
      ...(loanDetails?.status === LOAN_STATUS_PENDING
        ? [
            {
              label: "Remove",
              icon: <Cancel color="error" />,
              onClick: (Participant: IParticipants) =>
                handleParticipantStatus(Participant, "removed"),
            },
          ]
        : []),
    ];
  };

  return [
    {
      Header: "Name",
      accessor: (row: IParticipants) => `${row.investor.first_name} ${row.investor.last_name}`,
      minWidth: 200,
      Cell: ({ row }: any) => {
        const participant = row.original as IParticipants;
        const { investor } = participant;
        return (
          <FlexBox alignItems="center">
            <UkoAvatar src={""} sx={{ width: 30, height: 30 }} />
            <FlexBox flexDirection="column" ml={2}>
              <H6 className="mainColor semiBold">
                {beautifyName({ 
                  id: 0, // Using 0 as default since beautifyName likely doesn't use the id for name formatting
                  first_name: investor.first_name, 
                  last_name: investor.last_name 
                })}
              </H6>
              <Tiny color="text.disabled">
                {capitalizeFirstLetter(investor.user_type || "Investor")}
              </Tiny>
            </FlexBox>
          </FlexBox>
        );
      },
    },
    {
      Header: "Email",
      accessor: (row: IParticipants) => row.investor.email,
      minWidth: 150,
      Cell: ({ value }: any) => <Tiny>{value}</Tiny>,
    },
    {
      Header: "Account Type",
      accessor: (row: IParticipants) => row.investor.account_type,
      minWidth: 120,
      Cell: ({ value }: any) => (
        <Tiny>{capitalizeFirstLetter(value || "Individual")}</Tiny>
      ),
    },
    {
      Header: "Units Purchased",
      accessor: "units_purchased",
      minWidth: 120,
      Cell: ({ value }: any) => <Tiny>{value}</Tiny>,
    },
    {
      Header: "Amount Invested (UGX)",
      accessor: "amount_invested",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Tiny>{parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Tiny>
      ),
    },
    {
      Header: "Interest Amount (UGX)",
      accessor: "interest_amount",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Tiny>{parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Tiny>
      ),
    },
    {
      Header: "Expected Repayment (UGX)",
      accessor: "expected_repayment",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Tiny>{parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Tiny>
      ),
    },
    {
      Header: "Paid Amount (UGX)",
      accessor: "paid_amount",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Tiny>{parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Tiny>
      ),
    },
    {
      Header: "Status",
      accessor: (row: IParticipants) => (row.is_paid ? "Paid" : "Unpaid"),
      minWidth: 100,
      Cell: ({ row }: any) => {
        const participant = row.original as IParticipants;
        const { is_paid } = participant;
        const status = is_paid ? "Paid" : "Unpaid";
        return (
          <span
            className={`${getStatusClass(status)} font11 semiBold`}
            style={{ padding: "5px 10px" }}
          >
            {capitalizeFirstLetter(status)}
          </span>
        );
      },
    },
    {
      Header: "Wallet Balance",
      accessor: (row: IParticipants) => row.investor.wallet?.balance || "0.00",
      minWidth: 120,
      Cell: ({ value }: any) => (
        <Tiny>{parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Tiny>
      ),
    },
    {
      Header: "Action",
      accessor: "id",
      minWidth: 50,
      maxWidth: 50,
      Cell: ({ row }: any) => {
        const data = row.original as IParticipants;
        const actions = tableActions(data);
        
        // Only show actions if there are any available
        if (actions.length === 0) {
          return <Tiny>-</Tiny>;
        }
        
        return (
          <DropdownActionBtn
            key={row.id}
            actions={actions}
            metaData={data}
          />
        );
      },
    },
  ];
};

export default ParticipantsColumnShape;