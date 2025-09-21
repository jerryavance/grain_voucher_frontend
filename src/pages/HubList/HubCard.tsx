import { Button } from "@mui/material";
import { IHub } from "../Hub/Hub.interface";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinHubForm from "./JoinHubForm";
import {
  CardWrapper,
  Divider,
  ImageHeader,
} from "./CardComponents";
import useAuth from "../../hooks/useAuth";
import { CheckCircle, Person } from "@mui/icons-material";

interface HubCardProps {
  hub: IHub;
  userMemberships?: string[]; // Array of hub IDs the user is a member of
  onMembershipUpdate?: () => void;
}

export const HubCard: FC<HubCardProps> = ({ hub, userMemberships = [], onMembershipUpdate }) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { user }: any = useAuth();
  const navigate = useNavigate();

  const isMember = userMemberships.includes(hub.id);

  const handleView = () => {
    navigate(`/hub-list/details/${hub.id}`);
  };

  const handleJoinRequest = () => {
    setShowJoinForm(true);
  };

  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    if (onMembershipUpdate) {
      onMembershipUpdate();
    }
  };

  if (showJoinForm) {
    return (
      <CardWrapper className="compact-card">
        <div className="join-form-container">
          <JoinHubForm
            hubId={hub.id}
            hubName={hub.name}
            handleCancel={() => setShowJoinForm(false)}
            handleRefreshHubData={handleJoinSuccess}
          />
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper className="compact-card">
      {/* HEADER */}
      <ImageHeader type={hub.slug} height={70} />
      
      {/* BODY */}
      <div className="card-body">
        <div className="hub-info">
          <div className="hub-name">{hub.name}</div>
          <div className="hub-location">
            <span className="location-icon">📍</span>
            <span>{hub.location}</span>
          </div>
          {hub.hub_admin && (
            <div className="hub-admin">
              <Person sx={{ fontSize: 12, flexShrink: 0 }} />
              <span>{hub.hub_admin.first_name} {hub.hub_admin.last_name}</span>
            </div>
          )}
        </div>

        <Divider />

        <div className="card-actions">
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth 
            onClick={handleView}
            sx={{ 
              fontSize: '0.75rem', 
              padding: '6px 12px',
              minHeight: '32px',
              textTransform: 'none'
            }}
          >
            View Details
          </Button>
          
          {isMember ? (
            <Button 
              variant="contained" 
              size="small" 
              fullWidth
              disabled
              startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
              sx={{ 
                fontSize: '0.75rem', 
                padding: '6px 12px',
                minHeight: '32px',
                backgroundColor: '#4caf50',
                textTransform: 'none',
                '&.Mui-disabled': {
                  backgroundColor: '#4caf50',
                  color: 'white',
                  opacity: 0.9
                }
              }}
            >
              Member
            </Button>
          ) : (
            <Button 
              variant="contained" 
              size="small" 
              fullWidth
              onClick={handleJoinRequest}
              sx={{ 
                fontSize: '0.75rem', 
                padding: '6px 12px',
                minHeight: '32px',
                textTransform: 'none'
              }}
            >
              Apply to Join
            </Button>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};








// import { Button } from "@mui/material";
// import { IHub } from "../Hub/Hub.interface";
// import { FC, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import JoinHubForm from "./JoinHubForm";
// import {
//   CardWrapper,
//   DateIndicator,
//   Divider,
//   ImageHeader,
//   QRWrapper,
// } from "./CardComponents";
// import useAuth from "../../hooks/useAuth";
// import { APP_NAME, MEDIA_BASE_URL } from "../../api/constants";
// import UkoAvatar from "../../components/UkoAvatar";
// import { GppGood } from "@mui/icons-material";

// interface HubCardProps {
//   hub: IHub;
// }

// export const HubCard: FC<HubCardProps> = ({ hub }) => {
//   const [toggle, setToggle] = useState(false);
//   const { user }: any = useAuth();
//   const toggleCard = () => setToggle(!toggle);

//   if (toggle)
//     return <CardBack hub={hub} toggleCard={toggleCard} />;
//   return <CardFront hub={hub} toggleCard={toggleCard} />;
// };

// const CardFront = ({
//   hub,
//   toggleCard,
// }: {
//   hub: IHub;
//   toggleCard?: any;
// }) => {

//   const purpose = hub.name || "No Purpose";

//   const navigate = useNavigate();
//   const handleView = () => {
//     navigate(`/hubs-list/details/${hub.id}`);
//   };

//   return (
//     <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
//       {/* TAG */}

//       {/* HEADER */}
//       <ImageHeader type={hub.slug} />
//       {/* BODY */}
//       <div className="p20 flexColumn gap10">
//         <div className="flex gap10">
//           <div className="font16 bold flexGrow">{hub.location}</div>
//           <div className="textDisabled bold">• {hub.is_active} % </div>
//         </div>
//         <div className="font13 semiBold mainColor1">
//           <span className="textDisabled regular">@ </span>
//           {purpose}
//         </div>

//         <Divider />

//         <div className="flex gap10">
//           <Button variant="contained" fullWidth onClick={handleView}>
//             View
//           </Button>
//           <Button variant="contained" onClick={toggleCard}>
//             Request to Join
//           </Button>
//         </div>
//       </div>
//     </CardWrapper>
//   );
// };

// const CardBack = ({
//   hub,
//   toggleCard,
// }: {
//   hub: IHub;
//   toggleCard?: any;
// }) => {
//   return (
//     <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
//       <div className="h100 flexCenter">
//         <JoinHubForm
//             hubId={hub.id} // Pass the hub ID
//             handleCancel={toggleCard} // Pass cancel handler
//             handleRefreshHubData={() => { } } hubName={""}        
//         />
//     </div>
//     </CardWrapper>
//   );
// };


// export const AssetsCard = ({ data }: { data: any }) => {
//   const { user } = useAuth();

//   // Map API fields to the expected structure
//   const { id, hub_type, hub_name, issuer_country, hub_bank_details } = data || {};

//   const qrCodeData = {
//     hub_id: id,
//     user_id: user?.id
//   };

//   return (
//     <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
//       <ImageHeader type={hub_type} height={300} />
//       {/* USER */}
//       <div className="flexCenter">
//         <div
//           className="flexNullCenter gap10 whiteBg radius10 p20"
//           style={{
//             position: "absolute",
//             boxShadow: "rgba(145, 158, 171, 0.16) -40px 40px 80px",
//             padding: "10px 15px",
//           }}
//         >
//           <UkoAvatar
//             src={
//               `${MEDIA_BASE_URL}${user?.profile?.photo_url}` ||
//               "/static/avatar/001-man.svg"
//             }
//             sx={{
//               border: 2,
//               width: 60,
//               height: 60,
//               borderColor: "#ffffff00",
//             }}
//           />
//           <div>
//             <div className="semiBold">
//               {user?.first_name} {user?.last_name}
//             </div>

//             <div className="font12 textDisabled flexNullCenter gap5">
//               <GppGood sx={{ fontSize: 18 }} />
//               <div>Verified</div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* BASE */}
//       <div className="p20 flexCenter flexColumn gap10">
//         {/* TITLE */}
//         <div className="font18 bold" style={{ marginTop: 35 }}>
//           {hub_name}
//         </div>
//         <Divider />
//         <div className="flexNullCenter gap10">
//           {hub_bank_details?.name && (
//             <>
//               <div className="font13 text-center">{hub_bank_details?.name}</div>
//               <div className="textDisabled">|</div>
//             </>
//           )}
//           <div className="textDisabled bold">{issuer_country}</div>
//         </div>
//         {/* QRCODE */}
//         <QRWrapper
//           className="animate pointer mt5"
//           src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify(qrCodeData)}`}
//           alt="QR Code"
//         />
//       </div>
//     </CardWrapper>
//   );
// };