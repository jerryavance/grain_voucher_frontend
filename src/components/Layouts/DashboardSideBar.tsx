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
} from "@mui/material";
import { FC, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CanMakeTrades, IsSuperUser } from "../../utils/permissions";
import { IsHubAdmin } from "../../utils/permissions";
import { CanCreateDeposit } from "../../utils/permissions";
import { CanViewHubMembers } from "../../utils/permissions";
import { MenuList, IMenuItem } from "./MenuList";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import useAuth from "../../hooks/useAuth";

// ─── Sidebar shell ───────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 220; // wider so text + icon + arrow never squash

const MainMenu = styled(Box)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  boxShadow: theme.shadows[4],
  zIndex: theme.zIndex.drawer + 11,
  backgroundColor: theme.palette.primary.main,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  "&::-webkit-scrollbar": { width: 3 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255,255,255,0.2)",
    borderRadius: 4,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(255,255,255,0.4)",
  },
  [theme.breakpoints.down("md")]: { width: 260 },
}));

const LogoImage = styled("img")(() => ({
  maxHeight: 32,
  maxWidth: 90,
  objectFit: "contain",
}));

// ─── Props ────────────────────────────────────────────────────────────────────

interface SideNavBarProps {
  showMobileSideBar: boolean;
  closeMobileSideBar: () => void;
  toggleMobileSideBar: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardSideBar: FC<SideNavBarProps> = ({
  showMobileSideBar,
  closeMobileSideBar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const { user } = useAuth();
  const userRole = user?.role ?? "";

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
    canMakeTrades,
    userRole
  );

  const toggleMenu = (title: string) =>
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));

  const isActive = (path?: string) =>
    !!path && location.pathname === path;

  // Does any descendant of this item match the current route?
  const hasActiveDescendant = (item: IMenuItem): boolean => {
    if (isActive(item.path)) return true;
    return (item.subMenu ?? []).some(hasActiveDescendant);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Indent per depth level — kept small so deep items never overflow
  const INDENT = 10; // px per depth level
  const BASE_PL = 12; // base left padding

  const renderMenuItems = (items: IMenuItem[], depth = 0) => (
    <List disablePadding>
      {items
        .filter((item) => item.visible)
        .map((nav, index) => {
          const active = isActive(nav.path);
          const ancestorActive = !active && hasActiveDescendant(nav);
          const isOpen = openMenus[nav.title] ?? false;
          const pl = BASE_PL + depth * INDENT;

          // ── Section header (collapsible group title) ──────────────────────
          if (nav.isHeader) {
            return (
              <Box key={index}>
                <ListItemButton
                  onClick={() => toggleMenu(nav.title)}
                  sx={{
                    pl: `${ancestorActive ? pl - 3 : pl}px`,
                    pr: "8px",
                    py: depth === 0 ? "7px" : "5px",
                    mt: depth === 0 ? "6px" : "2px",
                    mx: "6px",
                    borderRadius: "8px",
                    // Cap width so button never spills outside sidebar
                    maxWidth: "calc(100% - 12px)",
                    color: ancestorActive ? "#fff" : "rgba(255,255,255,0.6)",
                    backgroundColor: ancestorActive
                      ? alpha("#fff", 0.12)
                      : "transparent",
                    "&:hover": {
                      backgroundColor: alpha("#fff", 0.1),
                      color: "#fff",
                    },
                    ...(ancestorActive && {
                      borderLeft: "3px solid rgba(255,255,255,0.7)",
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 28, color: "inherit", flexShrink: 0 }}
                  >
                    <nav.Icon sx={{ fontSize: depth === 0 ? 17 : 15 }} />
                  </ListItemIcon>

                  <ListItemText
                    primary={nav.title}
                    primaryTypographyProps={{
                      fontSize: depth === 0 ? 10.5 : 10,
                      fontWeight: 700,
                      letterSpacing: depth === 0 ? "0.04em" : "0.02em",
                      textTransform: depth === 0 ? "uppercase" : "none",
                      // Allow wrapping — no noWrap so text is never cut off
                      lineHeight: 1.3,
                    }}
                    sx={{ my: 0, mr: "2px", overflow: "hidden" }}
                  />

                  {/* Chevron pinned right, never overlaps text */}
                  <Box sx={{ display: "flex", flexShrink: 0, ml: "auto" }}>
                    {isOpen ? (
                      <ExpandLess sx={{ fontSize: 15, opacity: 0.7 }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: 15, opacity: 0.7 }} />
                    )}
                  </Box>
                </ListItemButton>

                {/* Children — NO outer margin/border wrapper; indentation lives on
                    the buttons themselves via the `pl` calculation above */}
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  {renderMenuItems(nav.subMenu ?? [], depth + 1)}
                </Collapse>
              </Box>
            );
          }

          // ── Regular leaf item ─────────────────────────────────────────────
          return (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  if (nav.path) {
                    navigate(nav.path);
                    closeMobileSideBar();
                  }
                }}
                sx={{
                  pl: `${active ? pl - 3 : pl}px`,
                  pr: "8px",
                  py: "5px",
                  mx: "6px",
                  borderRadius: "8px",
                  my: "1px",
                  // Cap width so button never spills outside sidebar
                  maxWidth: "calc(100% - 12px)",
                  color: active ? "#fff" : "rgba(255,255,255,0.65)",
                  backgroundColor: active ? alpha("#fff", 0.18) : "transparent",
                  ...(active && {
                    borderLeft: "3px solid #fff",
                  }),
                  "&:hover": {
                    backgroundColor: active
                      ? alpha("#fff", 0.22)
                      : alpha("#fff", 0.08),
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 26,
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    flexShrink: 0,
                  }}
                >
                  <nav.Icon sx={{ fontSize: depth > 0 ? 14 : 16 }} />
                </ListItemIcon>

                <ListItemText
                  primary={nav.title}
                  primaryTypographyProps={{
                    fontSize: depth > 0 ? 10 : 10.5,
                    fontWeight: active ? 700 : 500,
                    lineHeight: 1.3,
                    // Allow wrapping so nothing is ever truncated
                  }}
                  sx={{ my: 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
    </List>
  );

  // ─── Logo + nav content ────────────────────────────────────────────────────

  const sidebarContent = (
    <Box sx={{ minHeight: "100%", pb: 4 }}>
      {/* Logo bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: "12px",
          py: "10px",
          mx: "8px",
          mt: "8px",
          mb: "4px",
          borderRadius: "10px",
          backgroundColor: alpha("#fff", 0.12),
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <LogoImage src="/favicon.png" alt="Logo" />
      </Box>

      {/* Thin divider */}
      <Box
        sx={{
          mx: "16px",
          mb: "6px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      {renderMenuItems(topMenuList)}
    </Box>
  );

  // ─── Mobile drawer vs. fixed desktop sidebar ───────────────────────────────

  const downMd = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  if (downMd) {
    return (
      <Drawer
        anchor="left"
        open={showMobileSideBar}
        onClose={closeMobileSideBar}
        PaperProps={{
          sx: {
            width: 260,
            backgroundColor: (theme) => theme.palette.primary.main,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": { width: 3 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.2)",
              borderRadius: 4,
            },
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return <MainMenu>{sidebarContent}</MainMenu>;
};

export default DashboardSideBar;