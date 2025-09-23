import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import useTitle from "../../hooks/useTitle";
import { toast } from "react-hot-toast";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import MembershipColumnShape from "./HubMembershipColumnShape";
import ConfirmPrompt from "../../components/UI/Modal/ConfirmPrompt";
import { membershipService } from "./HubMembership.service";
import { IMembership } from "./HubMembership.interface";
import useAuth from "../../hooks/useAuth";

interface HubMembershipProps {
  hubId?: string;
}

const HubMembership = ({ hubId }: HubMembershipProps) => {
  useTitle("Hub Membership");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user: currentUser } = useAuth();
  const [memberships, setMemberships] = useState<IMembership[]>([]);
  const [filters, setFilters] = useState<any>({
    search: '',
    page: 1,
    page_size: INITIAL_PAGE_SIZE,
    hub_id: hubId,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<{
    open: boolean;
    applicant: IMembership | null;
  }>({
    open: false,
    applicant: null,
  });

  const isHubAdmin = currentUser?.role === 'hub_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    fetchMemberships();
  }, [filters?.page, filters?.page_size, filters?.hub_id]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipService.getHubMemberships(filters);
      let data: IMembership[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray((response as any).results)) {
        data = (response as any).results;
      }
      setMemberships(data);
    } catch (error: any) {
      console.error("Error fetching memberships:", error);
      if (error?.response?.status === 404) {
        toast.error("No memberships found or you don't have access to view them");
      } else if (error?.response?.status === 403) {
        toast.error("You don't have permission to view these memberships");
      } else {
        toast.error("Failed to load memberships");
      }
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    fetchMemberships();
  };

  const handleMembershipStatus = async (
    applicant: IMembership,
    status: "approved" | "rejected" | "remove" | "assign_agent" | "unassign_agent"
  ) => {
    try {
      if (status === "approved") {
        await membershipService.approveMembership(applicant.id, {
          status: "active",
          notes: "Approved by hub admin",
        });
        toast.success(`${applicant.user.name}'s application approved`);
      } else if (status === "rejected") {
        await membershipService.rejectMembership(applicant.id, "Rejected by hub admin");
        toast.success(`${applicant.user.name}'s application rejected`);
      } else if (status === "remove") {
        await membershipService.deleteMembership(applicant.id);
        toast.success(`${applicant.user.name} removed from hub`);
      } else if (status === "assign_agent") {
        await membershipService.updateMembershipRole(applicant.id, "agent");
        toast.success(`${applicant.user.name} assigned as agent`);
      } else if (status === "unassign_agent") {
        await membershipService.updateMembershipRole(applicant.id, "farmer");
        toast.success(`${applicant.user.name} unassigned as agent`);
      }
      handleRefreshData();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const filteredMemberships = memberships.filter((membership) => {
    if (!filters?.search) return true;
    const term = String(filters.search).toLowerCase();
    const name = membership.user?.name || "";
    const phone = membership.user?.phone_number || "";
    return name.toLowerCase().includes(term) || phone.includes(term);
  });

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
    setTimeout(() => {
      fetchMemberships();
    }, 300);
  };

  if (!isHubAdmin && !isSuperAdmin) {
    return (
      <Box p={3} textAlign="center">
        <h3>Access Denied</h3>
        <p>Only hub administrators can view membership details.</p>
      </Box>
    );
  }

  return (
    <Box pb={2}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 2 : 0,
        marginBottom: 2,
      }}>
        <SearchInput
          onBlur={(event: any) => handleSearch(event.target.value)}
          onChange={(event: any) => handleSearch(event.target.value)}
          type="text"
          placeholder="Search members by name or phone..."
          sx={{ width: isMobile ? '100%' : 'auto' }}
        />
      </Box>
      <Box sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '& .MuiTableContainer-root': { maxWidth: '100%' },
        '& table': { minWidth: isMobile ? '800px' : '100%' },
        '&::-webkit-scrollbar': { height: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '3px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '3px', '&:hover': { backgroundColor: '#a8a8a8' } },
      }}>
        <CustomTable
          columnShape={MembershipColumnShape({
            handleMembershipStatus,
            isHubAdmin: isHubAdmin || isSuperAdmin,
            isMobile,
          })}
          data={filteredMemberships}
          dataCount={filteredMemberships.length}
          pageInitialState={{
            pageSize: filters.page_size,
            pageIndex: filters.page - 1,
          }}
          setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
          loading={loading}
        />
      </Box>
      <ConfirmPrompt
        open={showRejectModal.open}
        handleClose={() => setShowRejectModal({ open: false, applicant: null })}
        title="Reject Application"
        text={`Are you sure you want to reject ${showRejectModal.applicant?.user?.name || 'this'} application?`}
        handleOk={() => {
          if (showRejectModal.applicant) {
            handleMembershipStatus(showRejectModal.applicant, "rejected");
            setShowRejectModal({ open: false, applicant: null });
          }
        }}
      />
    </Box>
  );
};

export default HubMembership;



// import { Box, useMediaQuery, useTheme } from "@mui/material";
// import { useEffect, useState } from "react";
// import CustomTable from "../../components/UI/CustomTable";
// import SearchInput from "../../components/SearchInput";
// import useTitle from "../../hooks/useTitle";
// import { toast } from "react-hot-toast";
// import { INITIAL_PAGE_SIZE } from "../../api/constants";
// import MembershipColumnShape from "./HubMembershipColumnShape";
// import ConfirmPrompt from "../../components/UI/Modal/ConfirmPrompt";
// import { membershipService } from "./HubMembership.service"; // Import the singleton instance
// import { IMembership } from "./HubMembership.interface";
// import useAuth from "../../hooks/useAuth";

// interface HubMembershipProps {
//   hubId?: string; // Optional prop to specify which hub's memberships to show
// }

// const HubMembership = ({ hubId }: HubMembershipProps) => {
//   useTitle("Hub Membership");

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { user: currentUser } = useAuth();
//   const [memberships, setMemberships] = useState<IMembership[]>([]);
//   const [filters, setFilters] = useState<any>({
//     search: '',
//     page: 1,
//     page_size: INITIAL_PAGE_SIZE,
//     hub_id: hubId, // Include hub_id if provided
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showRejectModal, setShowRejectModal] = useState<{
//     open: boolean;
//     applicant: IMembership | null;
//   }>({
//     open: false,
//     applicant: null,
//   });

//   // Check if current user is hub admin by role
//   const isHubAdmin = currentUser?.role === 'hub_admin';
//   const isSuperAdmin = currentUser?.role === 'super_admin';

//   useEffect(() => {
//     fetchMemberships();
//   }, [filters?.page, filters?.page_size, filters?.hub_id]);

//   const fetchMemberships = async () => {
//     try {
//       setLoading(true);
//       const response = await membershipService.getHubMemberships(filters);
      
//       // Ensure response is an array of IMembership
//       let data: IMembership[] = [];
//       if (Array.isArray(response)) {
//         data = response;
//       } else if (response && Array.isArray((response as any).results)) {
//         data = (response as any).results;
//       }
//       setMemberships(data);
//     } catch (error: any) {
//       console.error("Error fetching memberships:", error);
//       if (error?.response?.status === 404) {
//         toast.error("No memberships found or you don't have access to view them");
//       } else if (error?.response?.status === 403) {
//         toast.error("You don't have permission to view these memberships");
//       } else {
//         toast.error("Failed to load memberships");
//       }
//       setMemberships([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefreshData = () => {
//     fetchMemberships();
//   };

//   const handleMembershipStatus = async (
//     applicant: IMembership,
//     status: "approved" | "rejected"
//   ) => {
//     try {
//       if (status === "approved") {
//         // FIXED: Send 'active' instead of 'approved' and don't override the user's role
//         await membershipService.approveMembership(applicant.id, {
//           status: "active", // Changed from "approved" to "active"
//           // Remove the hardcoded role - let the backend handle the role logic
//           // or use the user's existing role
//           notes: "Approved by hub admin",
//         });
//         toast.success(`${applicant.user.name}'s application approved`);
//       } else {
//         await membershipService.rejectMembership(applicant.id, "Rejected by hub admin");
//         toast.success(`${applicant.user.name}'s application rejected`);
//       }
//       handleRefreshData();
//     } catch (error: any) {
//       const errorMessage =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         "Something went wrong";
//       toast.error(errorMessage);
//     }
//   };

//   const handleRemoveMember = async (member: IMembership) => {
//     try {
//       await membershipService.deleteMembership(member.id);
//       toast.success(`${member.user.name} removed from hub`);
//       handleRefreshData();
//     } catch (error: any) {
//       const errorMessage =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         "Failed to remove member";
//       toast.error(errorMessage);
//     }
//   };

//   const filteredMemberships = memberships.filter((membership) => {
//     if (!filters?.search) return true;
//     const term = String(filters.search).toLowerCase();
//     const name = membership.user?.name || "";
//     const phone = membership.user?.phone_number || "";
//     return name.toLowerCase().includes(term) || phone.includes(term);
//   });

//   const handleSearch = (searchTerm: string) => {
//     setFilters({ ...filters, search: searchTerm, page: 1 });
//     // Debounce search if needed
//     setTimeout(() => {
//       fetchMemberships();
//     }, 300);
//   };

//   if (!isHubAdmin && !isSuperAdmin) {
//     return (
//       <Box p={3} textAlign="center">
//         <h3>Access Denied</h3>
//         <p>Only hub administrators can view membership details.</p>
//       </Box>
//     );
//   }

//   return (
//     <Box pb={2}>
//       <Box sx={{
//         ...styles.tablePreHeader,
//         flexDirection: isMobile ? 'column' : 'row',
//         gap: isMobile ? 2 : 0,
//         alignItems: isMobile ? 'stretch' : 'center',
//       }}>
//         <SearchInput
//           onBlur={(event: any) => {
//             handleSearch(event.target.value);
//           }}
//           onChange={(event: any) => {
//             handleSearch(event.target.value);
//           }}
//           type="text"
//           placeholder="Search members by name or phone..."
//           sx={{ width: isMobile ? '100%' : 'auto' }}
//         />
//       </Box>

//       {/* Mobile-friendly table container */}
//       <Box sx={{
//         width: '100%',
//         overflowX: 'auto',
//         WebkitOverflowScrolling: 'touch',
//         '& .MuiTableContainer-root': {
//           maxWidth: '100%',
//         },
//         '& table': {
//           minWidth: isMobile ? '800px' : '100%',
//         },
//         // Better scrollbar styling for mobile
//         '&::-webkit-scrollbar': {
//           height: '6px',
//         },
//         '&::-webkit-scrollbar-track': {
//           backgroundColor: '#f1f1f1',
//           borderRadius: '3px',
//         },
//         '&::-webkit-scrollbar-thumb': {
//           backgroundColor: '#c1c1c1',
//           borderRadius: '3px',
//           '&:hover': {
//             backgroundColor: '#a8a8a8',
//           },
//         },
//       }}>
//         <CustomTable
//           columnShape={MembershipColumnShape({
//             handleMembershipStatus: (app: IMembership, status: string) => {
//               if (status === "rejected") {
//                 setShowRejectModal({ applicant: app, open: true });
//                 return;
//               }
//               if (status === "approved") {
//                 handleMembershipStatus(app, "approved");
//                 return;
//               }
//               if (status === "remove") {
//                 handleRemoveMember(app);
//                 return;
//               }
//             },
//             isHubAdmin: isHubAdmin || isSuperAdmin,
//           })}
//           data={filteredMemberships}
//           dataCount={filteredMemberships.length}
//           pageInitialState={{
//             pageSize: filters.page_size,
//             pageIndex: filters.page - 1,
//           }}
//           setPageIndex={(page: number) =>
//             setFilters({ ...filters, page: page + 1 })
//           }
//           pageIndex={filters?.page - 1}
//           setPageSize={(size: number) =>
//             setFilters({ ...filters, page_size: size, page: 1 })
//           }
//           loading={loading}
//         />
//       </Box>

//       <ConfirmPrompt
//         open={showRejectModal.open}
//         handleClose={() => setShowRejectModal({ open: false, applicant: null })}
//         title="Reject Application"
//         text={`Are you sure you want to reject ${showRejectModal.applicant?.user?.name || 'this'} application?`}
//         handleOk={() => {
//           if (showRejectModal.applicant) {
//             handleMembershipStatus(showRejectModal.applicant, "rejected");
//             setShowRejectModal({ open: false, applicant: null });
//           }
//         }}
//       />
//     </Box>
//   );
// };

// const styles = {
//   tablePreHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 2,
//   },
// };

// export default HubMembership;