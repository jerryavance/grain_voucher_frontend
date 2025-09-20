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
import { IInvestment } from "../InvestmentsList/Investment.interface";
import { InvestmentService } from "../InvestmentsList/Investment.service";
import Participants from "../InvestmentParticipants/InvestmentParticipants";
import { primaryColor, secondaryColor } from "../../../components/UI/Theme";
import LoadingScreen from "../../../components/LoadingScreen";
import toast from "react-hot-toast";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { InvestmentHeader } from "./InvestmentHeader";
import InvestmentProfile from "./InvestmentProfile";

let InvestmentDetailView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setShowModal } = useModalContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [InvestmentDetails, setInvestmentDetails] =
    useState<IInvestment | null>();

  const { investmentId, tabId } = useParams();
  const InvestmentId: string = investmentId as string;
  // const investmentId: string = location.pathname.split("/").pop() || "";
  const selectedTab = tabId || DETAILS;

  useEffect(() => {
    fetchInvestmentDetails();
  }, []);

  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      const results: any = await InvestmentService.getInvestmentDetails(
        InvestmentId
      );
      setInvestmentDetails(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (newValue: string) => {
    const route = `/investments/details/${investmentId}/${newValue}`;
    navigate(route);
  };

  const handleStartInvestment = () => {
    setShowModal(true);
  };

  const startInvestment = async () => {
    try {
      const response = await InvestmentService.startInvestment(InvestmentId);
      if (response) {
        fetchInvestmentDetails();
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
        <OptionsMenu onClick={handleItemClick} selected={selectedTab} InvestmentDetails={InvestmentDetails as any} />
      </ListWrapper>

      {/* MAIN AREA */}
      <ContentWrapper className="flexGrow h100 scroll flexColumn gap20">
        {/* TOP CARD */}
        <InvestmentHeader
          InvestmentDetails={InvestmentDetails}
          handleStartInvestment={handleStartInvestment}
          setShowModal={setShowModal}
          startInvestment={startInvestment}
        />

        {/* RENDER VIEWS */}
        {RenderView({
          investmentDetails: InvestmentDetails,
          InvestmentDetails: InvestmentDetails,
          handleRefreshInvestment: fetchInvestmentDetails,
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
  InvestmentDetails
}: {
  onClick?: any;
  toggleDrawer?: any;
  selected?: any;
  InvestmentDetails?: IInvestment
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
          ...([TYPE_ADMIN].includes(InvestmentDetails?.participant_details?.type || "")? [{ label: USER_RANKINGS, icon: EmojiEvents }]: []),
          { label: PARTICIPANTS, icon: People },
        ].map(({ icon: Icon, label }) => {
          const isSelected = selected === label;
          return (
            <ListItemButton
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
  details: InvestmentProfile,
};

const RenderView = ({
  InvestmentDetails,
  investmentDetails,
  handleRefreshInvestment,
  value,
}: any) => {
  // get component screen
  const Body: any = detailViews?.[value as keyof typeof detailViews] || <></>;

  // pass props to screens
  const renderBody = () =>
    cloneElement(<Body />, { investmentDetails, InvestmentDetails, handleRefreshInvestment });

  return renderBody();
};

// InvestmentDetail = () => <InvestmentDetailOld />;
export default InvestmentDetailView;

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
