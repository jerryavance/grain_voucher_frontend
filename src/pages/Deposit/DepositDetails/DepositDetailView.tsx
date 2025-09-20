import { Box, Drawer, List, ListItemButton, Tooltip } from "@mui/material";
import {
  Menu,
  AccountCircle,
  Assessment,
  History,
  Inventory,
} from "@mui/icons-material";
import { cloneElement, useEffect, useState } from "react";
import styled from "styled-components";
import {
  DETAILS,
} from "../../../api/constants";
import { stringify } from "../../../utils/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IDeposit } from "../Deposit.interface";
import { DepositService } from "../Deposit.service";
import { primaryColor, secondaryColor } from "../../../components/UI/Theme";
import LoadingScreen from "../../../components/LoadingScreen";
import toast from "react-hot-toast";
import { DepositHeader } from "./DepositHeader";
import DepositProfile from "./DepositProfile";

const DEPOSIT_ANALYTICS = "analytics";
const DEPOSIT_HISTORY = "history";

let DepositDetailView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [depositDetails, setDepositDetails] = useState<IDeposit | null>();

  const { depositId, tabId } = useParams();
  const selectedTab = tabId || DETAILS;

  useEffect(() => {
    fetchDepositDetails();
  }, []);

  const fetchDepositDetails = async () => {
    try {
      setLoading(true);
      const results: any = await DepositService.getDepositDetails(depositId as string);
      setDepositDetails(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch deposit details");
    }
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (newValue: string) => {
    const route = `/admin/deposits/details/${depositId}/${newValue}`;
    navigate(route);
  };

  const handleValidateDeposit = () => {
    setShowValidateModal(true);
  };

  const validateDeposit = async () => {
    try {
      const response = await DepositService.validateDeposit(depositId as string);
      if (response) {
        toast.success("Deposit validated successfully");
        fetchDepositDetails();
        setShowValidateModal(false);
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
          depositDetails={depositDetails as any} 
        />
      </ListWrapper>

      {/* MAIN AREA */}
      <ContentWrapper className="flexGrow h100 scroll flexColumn gap20">
        {/* TOP CARD */}
        <DepositHeader
          depositDetails={depositDetails}
          handleValidateDeposit={handleValidateDeposit}
          setShowValidateModal={setShowValidateModal}
          showValidateModal={showValidateModal}
          validateDeposit={validateDeposit}
        />

        {/* RENDER VIEWS */}
        {RenderView({
          depositDetails: depositDetails,
          handleRefreshDeposit: fetchDepositDetails,
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
          depositDetails={depositDetails ?? undefined}
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
  depositDetails
}: {
  onClick?: any;
  toggleDrawer?: any;
  selected?: any;
  depositDetails?: IDeposit
}) => {
  return (
    <>
      <div
        className="bold mainColor"
        style={{ padding: "20px 20px 10px 20px" }}
      >
        Deposit Menu
      </div>
      <List>
        {[
          { label: DETAILS, icon: AccountCircle },
          // Future menu items can be added here
          // { label: DEPOSIT_ANALYTICS, icon: Assessment },
          // { label: DEPOSIT_HISTORY, icon: History },
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
  details: DepositProfile,
  // Future views can be added here
  // analytics: DepositAnalytics,
  // history: DepositHistory,
};

const RenderView = ({
  depositDetails,
  handleRefreshDeposit,
  value,
}: any) => {
  // get component screen
  const Body: any = detailViews?.[value as keyof typeof detailViews] || <></>;

  // pass props to screens
  const renderBody = () =>
    cloneElement(<Body />, { depositDetails, handleRefreshDeposit });

  return renderBody();
};

export default DepositDetailView;

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