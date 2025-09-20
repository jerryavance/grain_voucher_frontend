import { Cancel, ChangeCircle } from "@mui/icons-material";
import FlexBox from "../../../components/FlexBox";
import { H6, Tiny } from "../../../components/Typography";
import DropdownActionBtn, {
  IDropdownAction,
} from "../../../components/UI/DropdownActionBtn";
import UkoAvatar from "../../../components/UkoAvatar";
import {
  beautifyName,
  capitalizeFirstLetter,
  getStatusClass,
} from "../../../utils/helpers";
import { IParticipants } from "./Participants.interface";
import {
  INVESTMENT_STATUS_PENDING,
  INVESTMENT_STATUS_ACTIVE,
  INVESTMENT_STATUS_COMPLETED,
  INVESTMENT_STATUS_CANCELLED,
  TYPE_ADMIN,
} from "../../../api/constants";
import { CanChangeParticipantRole } from "../../../utils/permissions";

const ParticipantsColumnShape = (options?: any) => {
  const { handleParticipantStatus, investmentDetails, handleChangeRole } =
    options;

  const tableActions = (participant: IParticipants): IDropdownAction[] => {
    if (participant.type === TYPE_ADMIN) return [];

    return [
      ...([INVESTMENT_STATUS_PENDING, INVESTMENT_STATUS_ACTIVE].includes(
        investmentDetails?.status
      ) && CanChangeParticipantRole(investmentDetails)
        ? [
            {
              label: "Change Role",
              icon: <ChangeCircle color="error" />,
              onClick: (Participant: IParticipants) =>
                handleChangeRole(Participant),
            },
          ]
        : []),
      ...(investmentDetails?.status === INVESTMENT_STATUS_PENDING
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
      accessor: (row: any) => row.user.first_name, // Accessor function to get the first name from the user object
      minWidth: 200,
      Cell: ({ row }: any) => {
        const { avatar, user, user_details } = row.original; // Destructure user object from row.original

        return (
          <FlexBox alignItems="center">
            <UkoAvatar src={avatar} sx={{ width: 30, height: 30 }} />
            <FlexBox flexDirection="column" ml={2}>
              <div className="mainColor semiBold">
                {beautifyName(user_details)}
              </div>{" "}
              {/* Access first_name from user object */}
              <Tiny color="text.disabled">{user.type}</Tiny>{" "}
              {/* Access type from user object */}
            </FlexBox>
          </FlexBox>
        );
      },
    },

    {
      Header: "Role",
      accessor: "type_display",
      minWidth: 100,
    },

    {
      Header: "Bank",
      accessor: "bank",
      minWidth: 100,
      Cell: ({ row }: any) => {
        const participant: IParticipants = row.original;
        return participant?.user_details?.bank_details?.name;
      },
    },

    {
      Header: "Status",
      accessor: "status",
      minWidth: 100,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <span
            className={`${getStatusClass(data.status)} font11 semiBold`}
            style={{ padding: "5px 10px" }}
          >
            {capitalizeFirstLetter(data?.status)}
          </span>
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 50,
      maxWidth: 50,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <DropdownActionBtn
            key={row.id}
            actions={tableActions(row.original)}
            metaData={data}
          />
        );
      },
    },
  ];
};

export default ParticipantsColumnShape;
