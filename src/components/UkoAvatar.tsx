import { alpha, Avatar, AvatarProps, styled } from "@mui/material";
import { FC } from "react";
import { primaryColor } from "./UI/Theme";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  borderColor: primaryColor,
  backgroundColor: alpha(primaryColor, 0.2),
  color: primaryColor,
}));

const UkoAvatar: FC<AvatarProps> = (props) => {
  return <StyledAvatar {...props} />;
};

export default UkoAvatar;
