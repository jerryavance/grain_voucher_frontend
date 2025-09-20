import { LogoSVG } from "../assets/svg/SvgIcons";

const LoadingScreen = () => {
  return (
    <div className="flexCenter vh100">
      <div className="loaderPulse" />
      <LogoSVG
        className="pulse"
        width={40}
        height={40}
        style={{ position: "absolute" }}
      />
    </div>
  );
};

export default LoadingScreen;

export const Loader = () => {
  return (
    <div className="flexCenter" style={{ minHeight: 100 }}>
      <div className="loaderPulse" />
      <LogoSVG
        className="pulse"
        width={30}
        height={30}
        style={{ position: "absolute" }}
      />
    </div>
  );
};
