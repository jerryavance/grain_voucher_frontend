// import React from "react";
// import { 
//   CheckCircle, 
//   Cancel, 
//   PersonRemove,
//   Visibility,
//   Phone,
//   Email 
// } from "@mui/icons-material";
// import FlexBox from "../../components/FlexBox";
// import { H6, Tiny } from "../../components/Typography";
// import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
// import UkoAvatar from "../../components/UkoAvatar";
// import { 
//   capitalizeFirstLetter, 
//   getStatusClass 
// } from "../../utils/helpers";
// import { IMembership } from "./HubMembership.interface";
// import { MEDIA_BASE_URL } from "../../api/constants";

// interface MembershipColumnShapeProps {
//   handleMembershipStatus: (applicant: IMembership, status: string) => void;
//   isHubAdmin?: boolean;
// }

// const MembershipColumnShape = (options: MembershipColumnShapeProps) => {
//   const { handleMembershipStatus, isHubAdmin } = options;

//   const tableActions = (membership: IMembership): IDropdownAction[] => {
//     if (!isHubAdmin) return [];

//     const actions: IDropdownAction[] = [];

//     // Actions based on membership status
//     if (membership.status === "pending") {
//       actions.push(
//         {
//           label: "Approve Application",
//           icon: <CheckCircle color="success" />,
//           onClick: (app: IMembership) => handleMembershipStatus(app, "approved"),
//         },
//         {
//           label: "Reject Application",
//           icon: <Cancel color="error" />,
//           onClick: (app: IMembership) => handleMembershipStatus(app, "rejected"),
//         }
//       );
//     }

//     if (membership.status === "approved" || membership.status === "active") {
//       actions.push({
//         label: "Remove from Hub",
//         icon: <PersonRemove color="error" />,
//         onClick: (app: IMembership) => handleMembershipStatus(app, "remove"),
//       });
//     }

//     // Always show view details
//     actions.push({
//       label: "View Details",
//       icon: <Visibility />,
//       onClick: (app: IMembership) => {
//         // You can implement a modal or navigate to user details
//         console.log("View user details:", app.user);
//       },
//     });

//     return actions;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'approved':
//       case 'accepted':
//       case 'active':
//         return '#4caf50';
//       case 'pending':
//         return '#ff9800';
//       case 'rejected':
//         return '#f44336';
//       default:
//         return '#666';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const columns: any[] = [
//     {
//       Header: "Member",
//       accessor: (row: IMembership) => row.user.name,
//       minWidth: 250,
//       Cell: ({ row }: any) => {
//         const membership = row.original as IMembership;
//         const { user } = membership;

//         return (
//           <FlexBox alignItems="center">
//             <UkoAvatar 
//               src="/static/avatar/001-man.svg" 
//               sx={{ width: 35, height: 35 }} 
//             />
//             <FlexBox flexDirection="column" ml={2}>
//               <H6 className="mainColor semiBold">
//                 {user.name}
//               </H6>
//               <Tiny color="text.disabled">
//                 {capitalizeFirstLetter(membership.role || "farmer")}
//               </Tiny>
//             </FlexBox>
//           </FlexBox>
//         );
//       },
//     },
//     {
//       Header: "Contact",
//       accessor: (row: IMembership) => row.user.phone_number,
//       minWidth: 150,
//       Cell: ({ row }: any) => {
//         const user = row.original.user;
//         return (
//           <FlexBox flexDirection="column">
//             {user.phone_number && (
//               <FlexBox alignItems="center" mb={0.5}>
//                 <Phone sx={{ fontSize: 14, mr: 1, color: '#666' }} />
//                 <Tiny>{user.phone_number}</Tiny>
//               </FlexBox>
//             )}
//           </FlexBox>
//         );
//       },
//     },
//     {
//       Header: "Hub",
//       accessor: (row: IMembership) => row.hub.name,
//       minWidth: 150,
//       Cell: ({ row }: any) => {
//         const hub = row.original.hub;
//         return (
//           <FlexBox flexDirection="column">
//             <H6 className="semiBold">{hub.name}</H6>
//             <Tiny color="text.disabled">{hub.location}</Tiny>
//           </FlexBox>
//         );
//       },
//     },
//     {
//       Header: "Role",
//       accessor: (row: IMembership) => row.role,
//       minWidth: 120,
//       Cell: ({ value }: any) => (
//         <Tiny 
//           sx={{
//             padding: '4px 8px',
//             borderRadius: '4px',
//             backgroundColor: '#f5f5f5',
//             fontWeight: 500
//           }}
//         >
//           {capitalizeFirstLetter(value || "Farmer")}
//         </Tiny>
//       ),
//     },
//     {
//       Header: "Status",
//       accessor: (row: IMembership) => row.status,
//       minWidth: 120,
//       Cell: ({ value, row }: any) => {
//         const membership = row.original as IMembership;
//         return (
//           <FlexBox flexDirection="column">
//             <span
//               style={{
//                 padding: "4px 10px",
//                 borderRadius: "4px",
//                 fontSize: "0.75rem",
//                 fontWeight: 600,
//                 color: 'white',
//                 backgroundColor: getStatusColor(value),
//                 textAlign: 'center',
//                 display: 'inline-block',
//                 minWidth: '70px'
//               }}
//             >
//               {capitalizeFirstLetter(value)}
//             </span>
//             {membership.requested_at && (
//               <Tiny color="text.disabled" mt={0.5}>
//                 Applied: {formatDate(membership.requested_at)}
//               </Tiny>
//             )}
//           </FlexBox>
//         );
//       },
//     },
//   ];

//   // Only show reason for pending applications or when admin
//   if (isHubAdmin) {
//     columns.push({
//       Header: "Application Reason",
//       accessor: (row: IMembership) => row.reason,
//       minWidth: 200,
//       Cell: ({ value }: any) => (
//         <Tiny 
//           sx={{ 
//             maxWidth: 180, 
//             overflow: 'hidden', 
//             textOverflow: 'ellipsis',
//             whiteSpace: 'nowrap'
//           }}
//           title={value} // Show full text on hover
//         >
//           {value || "No reason provided"}
//         </Tiny>
//       ),
//     });
//   }

//   // Only Hub admin sees Action column
//   if (isHubAdmin) {
//     columns.push({
//       Header: "Actions",
//       accessor: "id",
//       minWidth: 100,
//       maxWidth: 120,
//       Cell: ({ row }: any) => {
//         const membership = row.original as IMembership;
//         const actions = tableActions(membership);

//         if (actions.length === 0) return <Tiny>-</Tiny>;

//         return (
//           <DropdownActionBtn
//             key={membership.id}
//             actions={actions}
//             metaData={membership}
//           />
//         );
//       },
//     });
//   }

//   return columns;
// };

// export default MembershipColumnShape;


import React from "react";
import { 
  CheckCircle, 
  Cancel, 
  PersonRemove,
  Visibility,
  Phone,
  Email 
} from "@mui/icons-material";
import FlexBox from "../../components/FlexBox";
import { H6, Tiny } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import UkoAvatar from "../../components/UkoAvatar";
import { 
  capitalizeFirstLetter 
} from "../../utils/helpers";
import { IMembership } from "./HubMembership.interface";
import { MEDIA_BASE_URL } from "../../api/constants";

interface MembershipColumnShapeProps {
  handleMembershipStatus: (applicant: IMembership, status: string) => void;
  isHubAdmin?: boolean;
  isMobile?: boolean;
}

const MembershipColumnShape = (options: MembershipColumnShapeProps) => {
  const { handleMembershipStatus, isHubAdmin, isMobile } = options;

  const tableActions = (membership: IMembership): IDropdownAction[] => {
    if (!isHubAdmin) return [];

    const actions: IDropdownAction[] = [];

    // Actions based on membership status
    if (membership.status === "pending") {
      actions.push(
        {
          label: "Approve Application",
          icon: <CheckCircle color="success" />,
          onClick: (app: IMembership) => handleMembershipStatus(app, "approved"),
        },
        {
          label: "Reject Application",
          icon: <Cancel color="error" />,
          onClick: (app: IMembership) => handleMembershipStatus(app, "rejected"),
        }
      );
    }

    if ( membership.status === "active") {
      actions.push({
        label: "Remove from Hub",
        icon: <PersonRemove color="error" />,
        onClick: (app: IMembership) => handleMembershipStatus(app, "remove"),
      });
    }

    // Always show view details
    actions.push({
      label: "View Details",
      icon: <Visibility />,
      onClick: (app: IMembership) => {
        // You can implement navigation to member details page
        console.log("View user details:", app.user);
      },
    });

    return actions;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'active':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    if (isMobile) {
      // Shorter format for mobile
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns: any[] = [
    {
      Header: "Member",
      accessor: (row: IMembership) => row.user.name,
      minWidth: isMobile ? 200 : 250,
      Cell: ({ row }: any) => {
        const membership = row.original as IMembership;
        const { user } = membership;

        return (
          <FlexBox alignItems="center">
            <UkoAvatar 
              src="/static/avatar/001-man.svg" 
              sx={{ 
                width: isMobile ? 32 : 35, 
                height: isMobile ? 32 : 35 
              }} 
            />
            <FlexBox flexDirection="column" ml={isMobile ? 1.5 : 2}>
              <H6 
                className="mainColor semiBold"
                sx={{ 
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  lineHeight: 1.2 
                }}
              >
                {user.name}
              </H6>
              <Tiny 
                color="text.disabled"
                sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
              >
                {capitalizeFirstLetter(membership.role || "farmer")}
              </Tiny>
            </FlexBox>
          </FlexBox>
        );
      },
    },
    {
      Header: "Contact",
      accessor: (row: IMembership) => row.user.phone_number,
      minWidth: isMobile ? 140 : 150,
      Cell: ({ row }: any) => {
        const user = row.original.user;
        return (
          <FlexBox flexDirection="column">
            {user.phone_number && (
              <FlexBox alignItems="center" mb={0.5}>
                <Phone sx={{ 
                  fontSize: isMobile ? 12 : 14, 
                  mr: 0.5, 
                  color: '#666' 
                }} />
                <Tiny sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                  {isMobile ? 
                    user.phone_number.replace('+256', '0') : 
                    user.phone_number
                  }
                </Tiny>
              </FlexBox>
            )}
          </FlexBox>
        );
      },
    }
  ];

  // Add Hub column only if not showing specific hub members
  if (!isMobile) {
    columns.push({
      Header: "Hub",
      accessor: (row: IMembership) => row.hub.name,
      minWidth: 150,
      Cell: ({ row }: any) => {
        const hub = row.original.hub;
        return (
          <FlexBox flexDirection="column">
            <H6 className="semiBold" sx={{ fontSize: '0.9rem' }}>
              {hub.name}
            </H6>
            <Tiny color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              {hub.location.length > 20 ? 
                `${hub.location.substring(0, 20)}...` : 
                hub.location
              }
            </Tiny>
          </FlexBox>
        );
      },
    });
  }

  columns.push({
    Header: "Status",
    accessor: (row: IMembership) => row.status,
    minWidth: isMobile ? 100 : 120,
    Cell: ({ value, row }: any) => {
      const membership = row.original as IMembership;
      return (
        <FlexBox flexDirection="column" alignItems={isMobile ? "flex-start" : "flex-start"}>
          <span
            style={{
              padding: isMobile ? "3px 6px" : "4px 10px",
              borderRadius: "4px",
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              fontWeight: 600,
              color: 'white',
              backgroundColor: getStatusColor(value),
              textAlign: 'center',
              display: 'inline-block',
              minWidth: isMobile ? '60px' : '70px'
            }}
          >
            {capitalizeFirstLetter(value)}
          </span>
          {membership.requested_at && !isMobile && (
            <Tiny color="text.disabled" mt={0.5}>
              Applied: {formatDate(membership.requested_at)}
            </Tiny>
          )}
        </FlexBox>
      );
    },
  });

  // Show reason only for admin and on larger screens
  if (isHubAdmin && !isMobile) {
    columns.push({
      Header: "Application Reason",
      accessor: (row: IMembership) => row.reason,
      minWidth: 180,
      Cell: ({ value }: any) => (
        <Tiny 
          sx={{ 
            maxWidth: 160, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem'
          }}
          title={value} // Show full text on hover
        >
          {value || "No reason provided"}
        </Tiny>
      ),
    });
  }

  // Only Hub admin sees Action column
  if (isHubAdmin) {
    columns.push({
      Header: "Actions",
      accessor: "id",
      minWidth: isMobile ? 80 : 100,
      maxWidth: isMobile ? 80 : 120,
      Cell: ({ row }: any) => {
        const membership = row.original as IMembership;
        const actions = tableActions(membership);

        if (actions.length === 0) return <Tiny>-</Tiny>;

        return (
          <DropdownActionBtn
            key={membership.id}
            actions={actions}
            metaData={membership}
          />
        );
      },
    });
  }

  return columns;
};

export default MembershipColumnShape;