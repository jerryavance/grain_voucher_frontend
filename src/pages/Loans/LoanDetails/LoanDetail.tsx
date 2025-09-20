import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Typography,
  Card,
  Grid,
  Tab,
  styled,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { FC, SyntheticEvent, useEffect, useState } from "react";
import FlexBox from "../../../components/FlexBox";
import { H3, Span } from "../../../components/Typography";
import useTitle from "../../../hooks/useTitle";
import { useLocation } from "react-router-dom";
import Participants from "../LoanParticipants/LoanParticipants";
import {
  LOAN_STATUS_ACTIVE,
  LOAN_STATUS_PENDING,
} from "../../../constants/loan-options";
import { Button } from "antd";
import Visibility from "../../../components/UI/Visibility";
import { ILoan } from "../Loan.interface";
import LoadingScreen from "../../../components/LoadingScreen";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import toast from "react-hot-toast";
import {
  beautifyName,
  capitalizeFirstLetter,
  getStatusClass,
} from "../../../utils/helpers";
import { LoanService } from "../Loan.service";
import {
  Group,
  Menu,
  AccountCircle,
  People,
  GroupWork,
  RotateRight,
  EmojiEvents,
  Leaderboard,
  MeetingRoom,
  Star,
  Gavel,
} from "@mui/icons-material";
import { IsThisLoanTabMaster } from "../../../utils/permissions";
import { Tooltip } from "@mui/material";
import LoanProfile from "./LoanProfile";
import { useParams } from "react-router-dom"; // Add this import

const StyledCard = styled(Card)(() => ({
  position: "relative",
  paddingTop: 20,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 250,
  },
}));

const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(8), // Increased value to float higher (adjust as needed)
  right: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: "white",
  zIndex: 1300,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ContentWrapper = styled(FlexBox)(() => ({
  top: -20,
  alignItems: "center",
  position: "relative",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.primary,
}));

const StyledTabList = styled(TabList)(({ theme }) => ({
  [theme.breakpoints.down(780)]: {
    display: "none", // Hide on mobile
  },
  [theme.breakpoints.up("sm")]: {
    "& .MuiTabs-flexContainer": {
      minWidth: 200,
      justifyContent: "space-between",
    },
  },
}));

const StyledTabPanel = styled(TabPanel)(() => ({
  padding: 0,
}));

const LoanDetail: FC = () => {
  useTitle("Loan Details");

  const { setShowModal, showModal } = useModalContext();
  const [value, setValue] = useState("1");
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [LoanDetails, setLoanDetails] =
    useState<ILoan | null>();
  const location = useLocation();
  const LoanId: string = location.pathname.split("/").pop() || "";

  useEffect(() => {
    fetchLoanDetails();
  }, []);
  

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const results: any = await LoanService.getLoanDetails(
        LoanId
      );
      setLoanDetails(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChange = (_: SyntheticEvent | null, newValue: string) => {
    setValue(newValue);
    setMobileOpen(false); // Close sidebar on selection
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleApproveLoan = () => {
    setShowModal(true);
  };

  const approveLoan = async () => {
    try {
      const response = await LoanService.approveLoan(LoanId);
      if (response) {
        fetchLoanDetails();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box pb={4}>
      {/* <FloatingButton onClick={() => setMobileOpen(!mobileOpen)}>
        <Menu />
      </FloatingButton> */}
      <FloatingButton onClick={handleDrawerToggle}>
        <Tooltip title="Open Sidebar" placement="left">
          <Menu />
        </Tooltip>
      </FloatingButton>

      <ConfirmPrompt
        handleClose={() => setShowModal(false)}
        title="approve Loan"
        text="Are you sure you want to approve the Loan?"
        handleOk={approveLoan}
      />

      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        anchor="left"
        ModalProps={{ keepMounted: true }}
      >
        {/* Loan Name on Top of Menu */}
        <Box p={2}>
          <Typography variant="h6" color="white" align="center">
            {LoanDetails?.user?.first_name}{" "}    
          </Typography>
        </Box>

        <List>
          {[
            { label: "Profile", value: "details", icon: <AccountCircle /> },
            { label: "Participants", value: "2", icon: <People /> },
          ].map((item) => (
            <ListItem
              button
              key={item.value}
              onClick={() => handleChange(null, item.value)}
              style={{
                backgroundColor:
                  value === item.value ? "rgba(255, 255, 255, 0.2)" : "inherit",
              }}
            >
              <ListItemIcon style={{ color: "white" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </StyledDrawer>

      <TabContext value={value}>
        <StyledCard>
          <ContentWrapper style={{ width: "100%" }}>
            <Box marginLeft={3} marginTop={3} style={{ width: "100%" }}>
              <H3
                lineHeight={1.2}
                marginBottom={1}
              >{`${LoanDetails?.amount}`}</H3>
              <Grid container spacing={2}>
                <Grid item md={8} xs={12}>

                    <Grid container spacing={2} mb={2}>
                      <Grid item md={2} xs={12}>
                        <Span fontWeight={"bold"}>Payment Method : </Span>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Span>{LoanDetails?.payment_method}</Span>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} mb={2}>
                      <Grid item md={2} xs={12}>
                        <Span fontWeight={"bold"}>Status : </Span>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Span
                          className={getStatusClass(
                            LoanDetails?.status || ""
                          )}
                        >
                          {LoanDetails?.status}
                        </Span>
                      </Grid>
                    </Grid>

                    <Grid container mb={2}>
                      <Grid item md={2} xs={12}>
                        <Span fontWeight={"bold"}>Role: </Span>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Span
                          fontWeight={"bold"}
                          className="span-orange"
                          style={{
                            borderRadius: 7,
                            paddingLeft: 7,
                            paddingRight: 7,
                          }}
                        >
                          {capitalizeFirstLetter(
                            LoanDetails?.user
                              ?.user_type || ""
                          )}
                        </Span>
                      </Grid>
                    </Grid>
                </Grid>

                <Grid item md={4} xs={12}>
                  <Visibility
                    visible={
                      LoanDetails?.status === LOAN_STATUS_PENDING
                    }
                  >
                    <FlexBox
                      justifyContent="flex-end"
                      alignItems="center"
                      margin={2}
                    >
                      <Visibility
                        // visible={IsThisLoanTabMaster(
                        //   LoanDetails as any
                        // )} // for testing purposes
                        visible={true}
                      >
                        <Button
                          className="btn btn-primary"
                          onClick={handleApproveLoan}
                        >
                          Approve Loan
                        </Button>
                      </Visibility>
                    </FlexBox>
                  </Visibility>
                </Grid>
              </Grid>
            </Box>
          </ContentWrapper>

          <StyledTabList
            onChange={handleChange}
            style={{ paddingLeft: 20, paddingRight: 20 }}
            variant="scrollable"
          >
            <StyledTab label="Participants" value="2" />
            <StyledTab label="Details" value="details" />
          </StyledTabList>
        </StyledCard>

        <Box marginTop={3}>
          <StyledTabPanel value="2">
            <Participants 
              LoanDetails={LoanDetails} 
              handleRefreshLoan={fetchLoanDetails} 
            />
          </StyledTabPanel>

          <StyledTabPanel value="details">
            <LoanProfile loanDetails={LoanDetails} />
          </StyledTabPanel>
        </Box>
      </TabContext>
    </Box>
  );
};

export default LoanDetail;



// might not be useful