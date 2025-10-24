import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  styled,
  useMediaQuery,
  Theme,
  alpha,
  IconButton,
} from "@mui/material";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CanMakeTrades, IsSuperUser } from "../../utils/permissions";
import { IsHubAdmin } from "../../utils/permissions";
import { CanCreateDeposit } from "../../utils/permissions";
import { CanViewHubMembers } from "../../utils/permissions";
import { MenuList, IMenuItem } from "./MenuList";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

// Custom styled components
const MainMenu = styled(Box)(({ theme }) => ({
  width: 150,
  height: "100%",
  position: "fixed",
  boxShadow: theme.shadows[2],
  transition: "left 0.3s ease",
  zIndex: theme.zIndex.drawer + 11,
  backgroundColor: theme.palette.primary.main,
  [theme.breakpoints.down("md")]: {
    width: 250,
  },
}));

const LogoImage = styled('img')(({ theme }) => ({
  maxHeight: 30,
  maxWidth: 80,
  objectFit: 'contain',
  [theme.breakpoints.down("md")]: {
    maxWidth: 60,
  },
}));

interface SideNavBarProps {
  showMobileSideBar: boolean;
  closeMobileSideBar: () => void;
  toggleMobileSideBar: () => void;
}

const DashboardSideBar: FC<SideNavBarProps> = ({ showMobileSideBar, closeMobileSideBar, toggleMobileSideBar }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("Home");
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const downMd = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const isHubAdmin = IsHubAdmin();
  const isSuperUser = IsSuperUser();
  const canCreateDeposit = CanCreateDeposit();
  const canViewHubMembers = CanViewHubMembers();
  const canMakeTrades = CanMakeTrades();

  const topMenuList = MenuList(
    isSuperUser,
    canCreateDeposit,
    canViewHubMembers,
    isHubAdmin,
    canMakeTrades
  );

  const handleActiveMainMenu = (menuItem: IMenuItem) => () => {
    if (menuItem.subMenu) {
      setOpenMenus((prev) => ({ ...prev, [menuItem.title]: !prev[menuItem.title] }));
    }
    if (menuItem.path && !menuItem.isHeader) {
      setActive(menuItem.title);
      navigate(menuItem.path);
      closeMobileSideBar();
    }
  };

  const renderMenuItems = (items: IMenuItem[], depth = 0) => (
    <List disablePadding>
      {items
        .filter((item) => item.visible)
        .map((nav, index) => (
          <Box key={index}>
            <ListItem
              disablePadding
              sx={{
                backgroundColor: nav.isHeader ? alpha("#fff", 0.1) : "transparent",
              }}
            >
              <ListItemButton
                onClick={handleActiveMainMenu(nav)}
                sx={{
                  padding: `12px ${15 + depth * 10}px`,
                  color: nav.isHeader
                    ? "#fff"
                    : active === nav.title
                    ? "#fff"
                    : "rgba(255, 255, 255, 0.7)",
                  fontWeight: nav.isHeader || active === nav.title ? "bold" : "normal",
                }}
              >
                <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                  <nav.Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={nav.title}
                  primaryTypographyProps={{ fontSize: 10.5, fontWeight: "bold" }}
                />
                {nav.subMenu && (openMenus[nav.title] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {nav.subMenu && (
              <Collapse in={openMenus[nav.title]} timeout="auto" unmountOnExit>
                {renderMenuItems(nav.subMenu, depth + 1)}
              </Collapse>
            )}
          </Box>
        ))}
    </List>
  );

  const sidebarContent = (
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
        <LogoImage src="/wheat-sack.png" alt="Logo" />
      </Box>
      {renderMenuItems(topMenuList)}
    </Box>
  );

  if (downMd) {
    return (
      <Drawer
        anchor="left"
        open={showMobileSideBar}
        onClose={closeMobileSideBar}
        PaperProps={{
          sx: { width: 250, backgroundColor: (theme) => theme.palette.primary.main },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return <MainMenu>{sidebarContent}</MainMenu>;
};

export default DashboardSideBar;