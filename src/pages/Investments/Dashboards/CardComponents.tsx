import styled from "styled-components";
import { primaryColor } from "../../../components/UI/Theme";
import moment from "moment";
import { Tag } from "antd";

export const ImageHeader = ({
  type,
  height = 150,
}: {
  type: any;
  height?: number;
}) => {
  const getTagColor = () => {
    switch (type?.toLowerCase()) {
      case "institutional":
        return "gold-inverse";

      default:
        return "green-inverse";
    }
  };

  return (
    <div style={{ height, position: "relative" }}>
      <img
        src={"/static/background/user-cover-pic.png"}
        alt="Event Cover"
        height="100%"
        width="100%"
        style={{
          objectFit: "cover",
        }}
      />
      <GradientOverlay className="animate" />
      <Tag
        color={getTagColor()}
        className="semiBold font11"
        style={{ position: "absolute", top: 10, right: 5 }}
      >
        {type}
      </Tag>
    </div>
  );
};

export const DateIndicator = ({
  startDate,
  endDate,
}: {
  startDate: any;
  endDate: any;
}) => {
  return (
    <div className="flexNullCenter gap10">
      <div>
        <div className="font11 textDisabled">Starts On</div>
        <div className="font13 semiBold">
          {moment(startDate).format("ll") || "N/A"}
        </div>
      </div>

      <div className="flexGrow flex flexNullCenter">
        <Circle />
        <div
          className="flexGrow"
          style={{ borderBottom: `2px dashed ${primaryColor}` }}
        />
        <Circle />
      </div>
      <div>
        <div className="font11 textDisabled">Ends On</div>
        <div className="font13 semiBold">
          {moment(endDate).format("ll") || "N/A"}
        </div>
      </div>
    </div>
  );
};

export const Divider = () => (
  <div className="x100" style={{ backgroundColor: "#eee", height: 1 }} />
);

export const CardWrapper = styled.div`
  position: relative;
  min-height: 340px;
  height: fit-content;
  border: 0.5px solid #ddd;
  box-shadow: rgba(145, 158, 171, 0.16) -40px 40px 80px;
  &:hover {
    scale: 1.02;
  }

  @media (max-width: 960px) {
  }
`;

export const Circle = styled.div`
  height: 12px;
  width: 12px;
  background-color: ${primaryColor};
  border: 3px solid #ffffffb3;
  border-radius: 50%;
`;

export const GradientOverlay = styled.div`
  position: absolute;
  background-color: #00000000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  &:hover {
    background-color: #0000002b;
  }
`;

export const QRWrapper = styled.img`
  height: 100px;
  width: 100px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px dashed #ccc;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  transform-origin: center bottom;

  &:hover {
    scale: 1.5;
    border: 1px dashed #ccc;
    box-shadow: rgba(145, 158, 171, 1) 0 0 80px;
  }
`;
