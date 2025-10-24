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
  padding-left: 150px;
  height: 100vh;
  overflow: hidden;
  @media (max-width: 960px) {
    padding: 0;
  }
`;
const ContentWrapper = styled.div`
  padding: 0 20px;
  height: calc(100% - 60px);
  overflow: auto;
  @media (max-width: 960px) {
    height: calc(100% - 60px);
  }
`;