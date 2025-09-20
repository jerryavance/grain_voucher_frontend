import { Badge, Box, ButtonBase, Divider, styled } from "@mui/material";
import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import FlexBox from "../../FlexBox";
import { H6, Small, Tiny } from "../../Typography";
import UkoAvatar from "../../UkoAvatar";
import PopoverLayout from "./PopoverLayout";
import { ACCOUNT_PROFILE, MEDIA_BASE_URL } from "../../../api/constants";

const StyledSmall = styled(Small)(({ theme }) => ({
  display: "block",
  padding: "5px 1rem",
  cursor: "pointer",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.secondary.light
        : theme.palette.divider,
  },
}));

const ProfilePopover: FC = () => {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user }: any = useAuth();
  const [open, setOpen] = useState(false);

  console.log(user);
  

  const handleMenuItem = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <ButtonBase disableRipple ref={anchorRef} onClick={() => setOpen(true)}>
        {
          user?.profile?.photo_url?
          <img style={{ width: 30, height: 30, borderRadius: 15 }} src={ `${MEDIA_BASE_URL}${user?.profile?.photo_url}`} />
          :
          <UkoAvatar src={user?.avatar} sx={{ width: 30, height: 30 }} alt="User profile"/>
        }
        
      </ButtonBase>

      <PopoverLayout
        hiddenViewButton
        maxWidth={230}
        minWidth={200}
        popoverOpen={open}
        anchorRef={anchorRef}
        popoverClose={() => setOpen(false)}
        title={
          <FlexBox alignItems="center">

          {
            user?.profile?.photo_url?
            <img style={{ width: 40, height: 40, borderRadius: 20 }} src={ `${MEDIA_BASE_URL}${user?.profile?.photo_url}`} />
            :
            <UkoAvatar src={user?.avatar} sx={{ width: 40, height: 40 }} alt="User profile"/>
          }

            <Box ml={1}>
              <H6>
                {user?.first_name} {user?.last_name}
              </H6>
              <Tiny display="block" fontWeight={500} color="text.disabled">
                {user?.email}
              </Tiny>
            </Box>
          </FlexBox>
        }
      >
        <Box pt={1}>
          <StyledSmall
            onClick={() => handleMenuItem(`/dashboard/account/${ACCOUNT_PROFILE}`)}
          >
            Account
          </StyledSmall>

          <Divider sx={{ my: 1 }} />

          <StyledSmall
            onClick={() => {
              logout();
              toast.error("You Logout Successfully");
            }}
          >
            Sign Out
          </StyledSmall>
        </Box>
      </PopoverLayout>
    </>
  );
};

export default ProfilePopover;
