import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  styled,
  useMediaQuery,
  Theme,
  alpha,
} from "@mui/material";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IsBDM, IsFinance, IsSuperUser } from "../../utils/permissions";
import { IsHubAdmin } from "../../utils/permissions";
import { CanCreateDeposit } from "../../utils/permissions";
import { CanViewHubMembers } from "../../utils/permissions";
import { MenuList } from "./MenuList";

import { secondaryColor } from "../UI/Theme";

// Root component interface
interface SideNavBarProps {
  showMobileSideBar: boolean;
  closeMobileSideBar: () => void;
}

// Custom styled components
const MainMenu = styled(Box)(({ theme }) => ({
  left: 0,
  width: 150, // Increase width to accommodate longer names
  height: "100%",
  position: "fixed",
  boxShadow: theme.shadows[2],
  transition: "left 0.3s ease",
  zIndex: theme.zIndex.drawer + 11,
  backgroundColor: theme.palette.primary.main,
  [theme.breakpoints.down("md")]: { left: -80 },
}));

const BottomMenu = styled(BottomNavigation)<{ hidden: boolean }>(
  ({ theme, hidden }) => ({
    width: "100%",
    position: "fixed",
    bottom: hidden ? "-64px" : "0",
    boxShadow: theme.shadows[2],
    zIndex: theme.zIndex.drawer + 11,
    backgroundColor: theme.palette.primary.main,
    transition: "bottom 0.3s ease",
  })
);

// Create a styled component for the logo
const LogoImage = styled('img')(({ theme }) => ({
  maxHeight: 30,
  maxWidth: 80,
  objectFit: 'contain',
  [theme.breakpoints.down("md")]: {
    maxWidth: 60,
  },
}));

const DashboardSideBar: FC<SideNavBarProps> = ({ closeMobileSideBar }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  const downMd = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const isHubAdmin = IsHubAdmin();
  const isSuperUser = IsSuperUser();
  const canCreateDeposit = CanCreateDeposit();
  const canViewHubMembers = CanViewHubMembers();
  const isFinance = IsFinance();
  const isBDM = IsBDM();

  const topMenuList = MenuList(
    isSuperUser,
    canCreateDeposit,
    canViewHubMembers,
    isHubAdmin,
    isFinance,
    isBDM
  );

  const handleActiveMainMenu = (menuItem: any) => () => {
    setActive(menuItem.title);
    navigate(menuItem.path);
    closeMobileSideBar();
  };

  const mainSideBarContent = (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          backgroundColor: alpha("#fff", 0.15),
          p: "10px",
          m: 1,
          borderRadius: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          border: "1px solid #ffffff1c",
        }}
      >
        {/* Replace the APP_NAME text with the logo image */}
        <LogoImage src="/wheat-sack.png" alt="Logo" />
      </Box>
      {topMenuList
        .filter((item) => item.visible)
        .map((nav, index) => (
          <Box
            key={index}
            sx={{
              padding: "12px 15px",
              textAlign: "center",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: active === nav.title ? "#fff" : "rgba(255, 255, 255, 0.7)",
              fontWeight: active === nav.title ? "bold" : "normal",
            }}
            onClick={handleActiveMainMenu(nav)}
          >
            <nav.Icon fontSize="small" />
            <Box sx={{ fontSize: 10.5, fontWeight: "bold" }}>{nav.title}</Box>
          </Box>
        ))}
    </Box>
  );

  // Bottom menu for mobile
  if (downMd) {
    return (
      <BottomMenu
        hidden={false}
        value={active}
        onChange={(event, newValue) => {
          setActive(newValue);
          const selectedNav = topMenuList.find((nav) => nav.title === newValue);
          if (selectedNav) navigate(selectedNav.path);
        }}
        showLabels // Ensure labels are always visible
        sx={{
          "& .MuiBottomNavigationAction-root": {
            color: "rgba(255, 255, 255, 0.7)",
            minWidth: "0",
            flexGrow: 1,
            flexBasis: 0,
            padding: "1vw",
          },
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: "#fff", // White color for active icon and label
            fontWeight: "bold",
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "2.3vw",
            textAlign: "center",
          },
          "& .MuiBottomNavigationAction-label.Mui-selected": {
            fontWeight: "bold", // Ensure selected label is bold
            fontSize: "2.3vw", // Keep font size at 2.3vw for the selected item
          },
          "& .MuiSvgIcon-root": {
            fontSize: "5vw", // Consistent icon size
          },
        }}
      >
        {topMenuList
          .filter((item) => item.visible)
          .map((nav, index) => (
            <BottomNavigationAction
              key={index}
              label={nav.title}
              value={nav.title}
              icon={<nav.Icon />}
              sx={{
                color:
                  active === nav.title ? "#fff" : "rgba(255, 255, 255, 0.7)",
              }}
            />
          ))}
      </BottomMenu>
    );
  }

  return <MainMenu>{mainSideBarContent}</MainMenu>;
};

export default DashboardSideBar;