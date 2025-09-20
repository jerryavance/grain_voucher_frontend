import { Box, Drawer, List, ListItemButton, Tooltip } from "@mui/material";
import {
  Menu,
  Groups,
  LockOpen,
  AccountCircle,
  Topic,
} from "@mui/icons-material";
import { cloneElement, useState } from "react";
import styled from "styled-components";
import { stringify } from "../../../utils/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { primaryColor, secondaryColor } from "../../../components/UI/Theme";
import LoadingScreen from "../../../components/LoadingScreen";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import UserProfile from "../Profile/UserProfile";
import PastInvestments from "../../Investments/PastInvestments/PastInvestments";
import {
  ACCOUNT_CHANGE_PASSWORD,
  ACCOUNT_PAST_INVESTMENTS,
  ACCOUNT_PROFILE,
} from "../../../api/constants";
import ChangePassword from "../ChangePassword/ChangePassword";

const AccountDetailView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setShowModal, showModal } = useModalContext();
  const navigate = useNavigate();
  const location = useLocation();

  const { tabId } = useParams();

  const selectedTab = tabId || ACCOUNT_PROFILE;

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (newValue: string) => {
    const route = `/dashboard/account/${newValue}`;
    navigate(route);
  };

  const handleStartInvestment = () => {
    setShowModal(true);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Wrapper className="h100 flex gap20">
      {/* RIGHT ASIDE */}
      <ListWrapper className="whiteBg h100">
        <OptionsMenu onClick={handleItemClick} selected={selectedTab} />
      </ListWrapper>

      {/* MAIN AREA */}
      <ContentWrapper className="flexGrow h100 scroll flexColumn gap20">
        {/* TOP CARD */}

        {/* RENDER VIEWS */}
        {RenderView({
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
}: {
  onClick?: any;
  toggleDrawer?: any;
  selected?: any;
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
          { label: ACCOUNT_PROFILE, icon: AccountCircle },
          { label: ACCOUNT_PAST_INVESTMENTS, icon: Topic },
          { label: ACCOUNT_CHANGE_PASSWORD, icon: LockOpen },
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
  [ACCOUNT_PROFILE]: UserProfile,
  [ACCOUNT_PAST_INVESTMENTS]: PastInvestments,
  [ACCOUNT_CHANGE_PASSWORD]: ChangePassword,
};

const RenderView = ({
  InvestmentDetails,
  handleRefreshInvestment,
  value,
}: any) => {
  // get component screen
  const Body: any = detailViews?.[value as keyof typeof detailViews] || <></>;

  console.log(value);

  // pass props to screens
  const renderBody = () =>
    cloneElement(<Body />, { InvestmentDetails, handleRefreshInvestment });

  return renderBody();
};

// InvestmentDetail = () => <InvestmentDetailOld />;
export default AccountDetailView;

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
