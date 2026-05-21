import { FC, Fragment, useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSideBar";
import { ModalProvider } from "../../contexts/ModalDialogContext";
import styled from "styled-components";

const DashboardLayout: FC = ({ children }) => {
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);

  const toggleMobileSideBar = () => {
    setShowMobileSideBar((prev) => !prev);
  };

  return (
    <>
      <ModalProvider>
        <Fragment>
          <DashboardSidebar
            showMobileSideBar={showMobileSideBar}
            closeMobileSideBar={() => setShowMobileSideBar(false)}
            toggleMobileSideBar={toggleMobileSideBar}
          />

          <Wrapper className="x100">
            <DashboardNavbar toggleMobileSideBar={toggleMobileSideBar} />
            <ContentWrapper>{children || <Outlet />}</ContentWrapper>
          </Wrapper>
        </Fragment>
      </ModalProvider>
    </>
  );
};

export default DashboardLayout;

const Wrapper = styled.div`
  padding-left: 220px;   /* matches SIDEBAR_WIDTH in DashboardSideBar */
  height: 100vh;
  overflow: hidden;
  @media (max-width: 960px) {
    padding: 0;
  }

  /* When printing, drop the sidebar gap and viewport-height clamp so the
     dashboard content fills the page and isn't clipped by overflow:hidden. */
  @media print {
    padding-left: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }
`;

const ContentWrapper = styled.div`
  padding: 0 20px;
  height: calc(100% - 60px);
  overflow: auto;
  @media (max-width: 960px) {
    height: calc(100% - 60px);
  }

  @media print {
    height: auto !important;
    overflow: visible !important;
  }
`;