import { Box, Button, Card, Grid, styled, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import { TabList, TabPanel } from "@mui/lab";
import FlexBox from "../../../components/FlexBox";
import useTitle from "../../../hooks/useTitle";
import useAuth from "../../../hooks/useAuth";
import { UserService } from "./Users.service";
import UkoAvatar from "../../../components/UkoAvatar";
import { H3, Small, Span } from "../../../components/Typography";
import StatusBtn from "../../../components/UI/StatusBtn";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import UserDetailsInfo from "../UserProfile/ProfileDetails/UserDetailsInfo";
import { Loader } from "../../../components/LoadingScreen";
import { MEDIA_BASE_URL } from "../../../api/constants";
import { IUser } from "../../Users/Users.interface";
import ProfileModalForm from "./PhotoModalForm";

const StyledCard = styled(Card)(() => ({
  position: "relative",
}));

const ContentWrapper = styled(FlexBox)(() => ({
  alignItems: "center",
  position: "relative",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.primary,
}));

const StyledTabList = styled(TabList)(({ theme }) => ({
  [theme.breakpoints.down(780)]: {
    width: "100%",
    "& .MuiTabs-flexContainer": {
      justifyContent: "space-between",
    },
    marginBottom: 20,
  },
  [theme.breakpoints.up("sm")]: {
    "& .MuiTabs-flexContainer": {
      minWidth: 400,
      justifyContent: "space-between",
    },
  },
}));

const StyledTabPanel = styled(TabPanel)(() => ({
  padding: 0,
}));

export const StyledBoxWrapper = styled(Grid)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #E5EAF2",
  padding: "1rem",
  position: "relative",
}));

export const StyledActionButtons = styled(Button)(({ theme }) => ({
  padding: "0.2rem 0.8rem !important",
  minWidth: "24px !important",
}));

const UserProfile = () => {
  useTitle("Account Profile");

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshId, setRefreshId] = useState<string>("");
  const [userDetails, setUserDetails] = useState<any>({});
  const [userId, setUserId] = useState(null);
  const [showPhotoModal, setPhotoModal] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      setUserId(payload.user_id);
    }

    setRefreshId(new Date().getTime().toString());
  }, []);

  useEffect(() => {
    if (refreshId) fetchUserDetails();
  }, [refreshId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const results: any = await UserService.getUserDetails(userId || "0");
      setUserDetails(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Box pt={2} pb={4}>
      <StyledCard sx={{ mb: 2 }}>
        <FlexBox
          flexWrap="wrap"
          padding="1rem 1rem"
          alignItems="center"
          justifyContent="space-between"
        >
          <ContentWrapper>
            <Box position="relative">
              <UkoAvatar
                src={
                  `${MEDIA_BASE_URL}${user?.profile?.photo_url}` ||
                  "/static/avatar/001-man.svg"
                }
                sx={{
                  border: 4,
                  width: 100,
                  height: 100,
                  borderColor: "background.paper",
                }}
              />

              <Button
                variant="outlined"
                sx={styles.editButton}
                onClick={() => setPhotoModal(true)}
              >
                <AddAPhotoOutlinedIcon sx={{ fontSize: 16 }} />
              </Button>
            </Box>

            <Box marginLeft={3}>
              <H3 lineHeight={1.2} marginBottom={1}>
                {`${userDetails?.first_name} ${userDetails?.last_name}`}
              </H3>

              <Span sx={{ display: "block", marginBottom: "5px" }}>
                <Small color="text.disabled">
                  <Span fontWeight={"bold"}>Account Status: </Span>
                  <StatusBtn
                    type={userDetails?.is_active ? 1 : 0}
                    title={userDetails?.is_active ? "Active" : "In-active"}
                  />
                </Small>
              </Span>

              <Small display={"block"} color="text.disabled">
                <Span fontWeight={"bold"}>Joining Date: </Span>
                <Span>{`${formatDateToDDMMYYYY(
                  userDetails?.date_joined
                )}`}</Span>
              </Small>
            </Box>
          </ContentWrapper>
        </FlexBox>
      </StyledCard>

      <UserDetailsInfo userDetails={userDetails} />

      <ProfileModalForm
        open={showPhotoModal}
        handleClose={() => setPhotoModal(false)}
        photo={user?.profile?.photo_url}
        user={user as IUser}
        callback={fetchUserDetails}
      />
    </Box>
  );
};

const styles = {
  hidden: {
    display: "none",
  },
  editButton: {
    position: "absolute",
    bottom: "0.1rem",
    right: "-0.1rem",
    borderRadius: "50%",
    padding: "0 !important",
    width: "2rem",
    height: "2rem",
    minWidth: "2rem",
    backgroundColor: "white",

    "&:hover": {
      backgroundColor: "primary.main",
      color: "white",
    },
  },
};

export default UserProfile;
