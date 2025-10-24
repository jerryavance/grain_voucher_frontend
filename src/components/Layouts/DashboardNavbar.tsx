import { useContext } from "react";
import { TitleContext } from "../../contexts/TitleContext";
import styled from "styled-components";
import NotificationsPopover from "./popovers/NotificationsPopover";
import ProfilePopover from "./popovers/ProfilePopover";
import LanguagePopover from "./popovers/LanguagePopover";
import { LogoSVG } from "../../assets/svg/SvgIcons";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface DashboardNavbarProps {
  toggleMobileSideBar: () => void;
}

const DashboardNavbar = ({ toggleMobileSideBar }: DashboardNavbarProps) => {
  const { title } = useContext(TitleContext);

  return (
    <Wrapper className="whiteBg flexNullCenter x100">
      {/* HAMBURGER FOR MOBILE */}
      <IconButton
        sx={{ display: { xs: "block", md: "none" }, mr: 1 }}
        onClick={toggleMobileSideBar}
      >
        <MenuIcon />
      </IconButton>
      {/* LOGO */}
      <LogoSVG width={50} height={40} />
      {/* TITLE */}
      <div className="flexGrow">
        <div className="bold" style={{ fontSize: 16 }}>
          {title}
        </div>
      </div>

      {/* END */}
      <>
        <TaglineWrapper id="lang" className="font11 textDisabled">
          Your grain's worth, digitally realized.
        </TaglineWrapper>

        {/* <NotificationsPopover /> */}
        <ProfilePopover />
      </>
    </Wrapper>
  );
};

export default DashboardNavbar;

const Wrapper = styled.div`
  height: 60px;
  padding-inline: 20px;
  gap: 15px;
  z-index: 11;
  box-shadow: 1px -11px 20px 0px #00000057;
  position: relative;

  @media (max-width: 960px) {
    #lang {
      display: none;
    }
  }
`;

const TaglineWrapper = styled.div`
  border-right: 1px solid #ddd;
  padding-right: 15px;
`;