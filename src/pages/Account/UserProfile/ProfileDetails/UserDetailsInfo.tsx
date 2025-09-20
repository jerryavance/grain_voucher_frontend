import { Grid, styled } from "@mui/material";
import { FC } from "react";
import { formatDateToDDMMYYYY } from "../../../../utils/date_formatter";
import { DetailsView } from "../../../../components/Layouts/views/DetailsView";

export const StyledBoxWrapper = styled(Grid)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #E5EAF2",
  padding: "1rem",
  position: "relative",
}));

export interface IUserDetailsProps {
  userDetails: any;
}

const UserDetailsInfo: FC<IUserDetailsProps> = ({ userDetails }) => {
  const {
    extra_details,
    first_name,
    last_name,
    account_type,
    profile,
    phone_number,
    user_type,
    email,
  } = userDetails || {};

  const { country, dateofbirth, gender } = profile || {};

  const profileFields = [
    { label: "first_name", value: first_name, field: "first_name" },
    { label: "last_name", value: last_name, field: "last_name" },
    { label: "other_name", value: last_name, field: "other_name" },
    {
      label: "date of birth",
      value: formatDateToDDMMYYYY(dateofbirth),
    },
    { label: "email", value: email },
    { label: "country", value: country },
    { label: "gender", value: gender },
    { label: "phone_number", value: phone_number, field: "phone_number" },
    { label: "account_type", value: account_type },
    { label: "user_type", value: user_type },
  ];

  return (
    <div className="radius10 whiteBg p20">
      <DetailsView title="Profile Details" items={profileFields} />
    </div>
  );
};

export default UserDetailsInfo;
