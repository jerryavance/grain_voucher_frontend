import styled from "styled-components";
import { primaryColor } from "../../components/UI/Theme";
import { Tag } from "antd";

export const ImageHeader = ({
  type,
  height = 70,
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
    <ImageHeaderWrapper style={{ height }}>
      <img
        src={"/static/background/user-cover-pic.png"}
        alt="Hub Cover"
        height="100%"
        width="100%"
        style={{
          objectFit: "cover",
        }}
      />
      <GradientOverlay />
      <Tag
        color={getTagColor()}
        className="semiBold"
        style={{ 
          position: "absolute", 
          top: 6, 
          right: 6,
          fontSize: '0.65rem',
          padding: '2px 6px',
          lineHeight: 1.2,
          height: 'auto',
          border: 'none'
        }}
      >
        {type}
      </Tag>
    </ImageHeaderWrapper>
  );
};

const ImageHeaderWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
`;

export const Divider = () => (
  <div className="divider" />
);

export const CardWrapper = styled.div`
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &.compact-card {
    min-height: 240px;
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .card-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    min-height: 0; /* Prevents flex shrinking issues */
  }

  .hub-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }

  .hub-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    word-wrap: break-word;
  }

  .hub-location {
    font-size: 0.8rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1.2;
  }

  .location-icon {
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .hub-admin {
    font-size: 0.75rem;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1.2;
  }

  .divider {
    height: 1px;
    background-color: #f0f0f0;
    margin: 8px 0;
    flex-shrink: 0;
  }

  .card-actions {
    display: flex;
    gap: 8px;
    flex-direction: column;
    flex-shrink: 0;
    margin-top: auto;
  }

  .join-form-container {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
  }

  @media (max-width: 768px) {
    &.compact-card {
      min-height: 220px;
    }
    
    .card-body {
      padding: 12px;
      gap: 8px;
    }
    
    .hub-name {
      font-size: 0.9rem;
    }
    
    .hub-location {
      font-size: 0.75rem;
    }

    .hub-admin {
      font-size: 0.7rem;
    }

    .card-actions {
      gap: 6px;
    }
  }

  @media (max-width: 480px) {
    &.compact-card {
      min-height: 200px;
    }
    
    .card-body {
      padding: 10px;
    }
  }
`;

export const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%);
  pointer-events: none;
`;






// import styled from "styled-components";
// import { primaryColor } from "../../components/UI/Theme";
// import moment from "moment";
// import { Tag } from "antd";

// export const ImageHeader = ({
//   type,
//   height = 150,
// }: {
//   type: any;
//   height?: number;
// }) => {
//   const getTagColor = () => {
//     switch (type?.toLowerCase()) {
//       case "institutional":
//         return "gold-inverse";
//       default:
//         return "green-inverse";
//     }
//   };

//   return (
//     <div style={{ height, position: "relative" }}>
//       <img
//         src={"/static/background/user-cover-pic.png"}
//         alt="Event Cover"
//         height="100%"
//         width="100%"
//         style={{
//           objectFit: "cover",
//         }}
//       />
//       <GradientOverlay className="animate" />
//       <Tag
//         color={getTagColor()}
//         className="semiBold font11"
//         style={{ position: "absolute", top: 10, right: 5 }}
//       >
//         {type}
//       </Tag>
//     </div>
//   );
// };

// export const DateIndicator = ({
//   startDate,
//   endDate,
// }: {
//   startDate: any;
//   endDate: any;
// }) => {
//   return (
//     <div className="flexNullCenter gap10">
//       <div>
//         <div className="font11 textDisabled">Starts On</div>
//         <div className="font13 semiBold">
//           {moment(startDate).format("ll") || "N/A"}
//         </div>
//       </div>

//       <div className="flexGrow flex flexNullCenter">
//         <Circle />
//         <div
//           className="flexGrow"
//           style={{ borderBottom: `2px dashed ${primaryColor}` }}
//         />
//         <Circle />
//       </div>
//       <div>
//         <div className="font11 textDisabled">Ends On</div>
//         <div className="font13 semiBold">
//           {moment(endDate).format("ll") || "N/A"}
//         </div>
//       </div>
//     </div>
//   );
// };

// export const Divider = () => (
//   <div className="x100" style={{ backgroundColor: "#eee", height: 1 }} />
// );

// export const CardWrapper = styled.div`
//   position: relative;
//   min-height: 340px;
//   height: fit-content;
//   border: 0.5px solid #ddd;
//   box-shadow: rgba(145, 158, 171, 0.16) -40px 40px 80px;
//   &:hover {
//     scale: 1.02;
//   }

//   @media (max-width: 960px) {
//   }
// `;

// export const Circle = styled.div`
//   height: 12px;
//   width: 12px;
//   background-color: ${primaryColor};
//   border: 3px solid #ffffffb3;
//   border-radius: 50%;
// `;

// export const GradientOverlay = styled.div`
//   position: absolute;
//   background-color: #00000000;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;

//   &:hover {
//     background-color: #0000002b;
//   }
// `;

// export const QRWrapper = styled.img`
//   height: 100px;
//   width: 100px;
//   padding: 10px;
//   background-color: #f9f9f9;
//   border-radius: 10px;
//   border: 1px dashed #ccc;
//   box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
//   transform-origin: center bottom;

//   &:hover {
//     scale: 1.5;
//     border: 1px dashed #ccc;
//     box-shadow: rgba(145, 158, 171, 1) 0 0 80px;
//   }
// `;
