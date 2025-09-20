import { Box, Drawer, List, ListItemButton, Tooltip } from "@mui/material";
import {
  Group,
  Menu,
  AccountCircle,
  People,
  GroupWork,
  RotateRight,
  EmojiEvents,
  Leaderboard,
} from "@mui/icons-material";
import { cloneElement, useEffect, useState } from "react";
import styled from "styled-components";
import {
  PARTICIPANTS,
  DETAILS,
  USER_RANKINGS,
  TYPE_ADMIN,
} from "../../../api/constants";
import { stringify } from "../../../utils/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ILoan } from "../Loan.interface";
import { LoanService } from "../Loan.service";
import Participants from "../LoanParticipants/LoanParticipants";
import { primaryColor, secondaryColor } from "../../../components/UI/Theme";
import LoadingScreen from "../../../components/LoadingScreen";
import toast from "react-hot-toast";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { LoanHeader } from "./LoanHeader";
import LoanProfile from "./LoanProfile";

let LoanDetailView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [LoanDetails, setLoanDetails] = useState<ILoan | null>();

  const { loanId, tabId } = useParams();
  const LoanId: string = loanId as string;
  // const LoanId: string = location.pathname.split("/").pop() || "";
  const selectedTab = tabId || DETAILS;

  useEffect(() => {
    fetchLoanDetails();
  }, []);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const results: any = await LoanService.getLoanDetails(LoanId);
      setLoanDetails(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (newValue: string) => {
    const route = `/loan/details/${loanId}/${newValue}`;
    navigate(route);
  };

  const handleApproveLoan = () => {
    setShowApproveModal(true);
  };

  const handleRejectLoan = () => {
    setShowRejectModal(true);
  };

  const approveLoan = async () => {
    try {
      const response = await LoanService.approveLoan(LoanId);
      if (response) {
        toast.success("Loan approved successfully");
        fetchLoanDetails();
        setShowApproveModal(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const rejectLoan = async () => {
    try {
      const response = await LoanService.rejectLoan(LoanId);
      if (response) {
        toast.success("Loan rejected successfully");
        fetchLoanDetails();
        setShowRejectModal(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Wrapper className="h100 flex gap20">
      {/* RIGHT ASIDE */}
      <ListWrapper className="whiteBg h100">
        <OptionsMenu 
          onClick={handleItemClick} 
          selected={selectedTab} 
          LoanDetails={LoanDetails as any} 
        />
      </ListWrapper>

      {/* MAIN AREA */}
      <ContentWrapper className="flexGrow h100 scroll flexColumn gap20">
        {/* TOP CARD */}
        <LoanHeader
          LoanDetails={LoanDetails}
          handleApproveLoan={handleApproveLoan}
          handleRejectLoan={handleRejectLoan}
          setShowModal={setShowApproveModal}
          setShowRejectModal={setShowRejectModal}
          showModal={showApproveModal}
          showRejectModal={showRejectModal}
          ApproveLoan={approveLoan}
          RejectLoan={rejectLoan}
        />

        {/* RENDER VIEWS */}
        {RenderView({
          loanDetails: LoanDetails,
          LoanDetails: LoanDetails,
          handleRefreshLoan: fetchLoanDetails,
          value: selectedTab,
        })}
      </ContentWrapper>

      {/* FAB MOBILE */}
      <FloatingButton className="animate" onClick={toggleDrawer}>
        <Tooltip title="Open Sidebar" placement="left">
          <Menu />
        </Tooltip>
      </FloatingButton>

      {/* DRAWER MOBILE */}
      <Drawer
        open={mobileOpen}
        onClose={toggleDrawer}
        anchor="bottom"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <OptionsMenu
          onClick={handleItemClick}
          toggleDrawer={toggleDrawer}
          selected={selectedTab}
        />
        <Box height={60} />
      </Drawer>
    </Wrapper>
  );
};

const OptionsMenu = ({
  onClick,
  toggleDrawer,
  selected,
  LoanDetails
}: {
  onClick?: any;
  toggleDrawer?: any;
  selected?: any;
  LoanDetails?: ILoan
}) => {
  return (
    <>
      <div
        className="bold mainColor"
        style={{ padding: "20px 20px 10px 20px" }}
      >
        Options Menu
      </div>
      <List>
        {[
          { label: DETAILS, icon: AccountCircle },
          ...([TYPE_ADMIN].includes(LoanDetails?.user?.user_type || "")? [{ label: USER_RANKINGS, icon: EmojiEvents }]: []),
          { label: PARTICIPANTS, icon: People },
        ].map(({ icon: Icon, label }) => {
          const isSelected = selected === label;
          return (
            <ListItemButton
              key={label}
              className="animate"
              sx={{ gap: 2, py: isSelected ? 2.3 : 1.3 }}
              selected={isSelected}
              onClick={() => {
                onClick(label);
                if (toggleDrawer) toggleDrawer();
              }}
            >
              {Icon && (
                <Icon
                  sx={{
                    fontSize: 16,
                    fill: isSelected ? primaryColor : "black",
                  }}
                />
              )}
              <div
                className={`font12 capitalize ${
                  isSelected && "mainColor semiBold"
                }`}
              >
                {stringify(label)}
              </div>
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
};

// tab screens
const detailViews = {
  participants: Participants,
  details: LoanProfile,
};

const RenderView = ({
  LoanDetails,
  loanDetails,
  handleRefreshLoan,
  value,
}: any) => {
  // get component screen
  const Body: any = detailViews?.[value as keyof typeof detailViews] || <></>;

  // pass props to screens
  const renderBody = () =>
    cloneElement(<Body />, { loanDetails, LoanDetails, handleRefreshLoan });

  return renderBody();
};

// LoanDetail = () => <LoanDetailOld />;
export default LoanDetailView;

const ListWrapper = styled.div`
  width: 200px;
  min-width: 200px;
  margin-left: -20px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const Wrapper = styled.div``;

const ContentWrapper = styled.div`
  // paddingLeft: 20,
  padding-block: 20px;
  @media (max-width: 960px) {
  }
`;

const FloatingButton = styled.div`
  padding: 10px;
  border-radius: 15px;
  bottom: 70px;
  right: 20px;
  color: white;
  background-color: ${primaryColor};
  position: fixed;
  display: none;
  z-index: 20;

  &:hover {
    background-color: ${secondaryColor};
    scale: 1.05;
  }

  @media (max-width: 960px) {
    display: block;
  }
`;