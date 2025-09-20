import { FC } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import InfoSlider from "../../../components/sliders/InfoSlider";
import { primary } from "../../../theme/themeColors";
import Login from "./Login";
import Register from "../Register/Register";

export const LoginPortal: FC = () => {
  const location = useLocation().pathname;

  function getComponent() {
    switch (location) {
      case "/login":
        return <Login />;
      case "/register":
        return <Register />;
      default:
        break;
    }
  }

  return (
    <WrapperMain id="login" className="flexSpaceCenter">
      <LeftSide className="flexCenter flexColumn animate poka_pattern_dark">
        <div className="x100">
          <InfoSlider />
        </div>
      </LeftSide>
      <RightSide className="whiteBg">{getComponent()}</RightSide>
    </WrapperMain>
  );
};

const WrapperMain = styled.section`
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  @media (max-width: 960px) {
    flex-direction: column;
    background-image: url("/grain_image_1.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
`;

const LeftSide = styled.div`
  position: relative;
  width: 55%;
  height: 100%;
  background-image: url("/grain_image_1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  gap: 20px;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4); /* Dark overlay for readability */
    z-index: 1;
  }
  > * {
    position: relative;
    z-index: 2;
  }
  @media (max-width: 960px) {
    display: none;
  }
`;

const RightSide = styled.div`
  width: 45%;
  height: 100%;
  overflow: auto;
  display: inline-grid;
  @media (max-width: 960px) {
    width: 100%;
    height: auto;
    order: 1;
    text-align: center;
    padding: 40px;
    overflow: inherit;
    background-color: rgba(255, 255, 255, 0.95); /* Semi-transparent white for visibility with subtle background peek */
  }
`;