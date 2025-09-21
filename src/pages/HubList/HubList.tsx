import { Input, Pagination } from "antd";
import styled from "styled-components";
import { HubCard } from "./HubCard";
import { CalendarView } from "../../components/calender/CalendarView";
import { SectionTitle } from "../../components/elements/Elements";
import useTitle from "../../hooks/useTitle";
import { secondaryColor } from "../../components/UI/Theme";
import SearchIcon from "../../icons/SearchIcon";
import { IHub } from "../Hub/Hub.interface";
import { useEffect, useState } from "react";
import { HubService } from "../Hub/Hub.service";
import { MembershipService } from "../Membership/HubMembership.service";
import LoadingScreen from "../../components/LoadingScreen";
import { toast } from "react-hot-toast";

const HubList = () => {
  const [loading, setLoading] = useState(false);
  const [hubList, setHubList] = useState<IHub[]>([]);
  const [userMemberships, setUserMemberships] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  useTitle("Grain Hubs");

  const fetchHubs = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params: any = {
        active: true,
        page,
        page_size: pageSize,
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await HubService.getHubs(params);
      setHubList(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error("Error fetching Hubs:", error);
      toast.error("Failed to fetch hubs");
    }
    setLoading(false);
  };

  const fetchUserMemberships = async () => {
    try {
      // Assuming you have an API to get user's memberships
      // const response = await MembershipService.getUserMemberships();
      // setUserMemberships(response.map(membership => membership.hub_id));
      
      // For now, using empty array - replace with actual API call
      setUserMemberships([]);
    } catch (error) {
      console.error("Error fetching user memberships:", error);
    }
  };

  useEffect(() => {
    fetchHubs(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    fetchUserMemberships();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchHubs(1, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMembershipUpdate = () => {
    fetchUserMemberships();
    fetchHubs(currentPage, searchTerm);
  };

  if (loading && hubList.length === 0) return <LoadingScreen />;

  return (
    <Wrapper className="flexColumn gap20">
      <TitleWrapper className="flexSpaceCenter gap20">
        <SectionTitle
          title="Grain Hubs"
          subtitle="Find and join grain hubs in your area"
          tags={[{ label: `${totalCount} Hubs`, color: secondaryColor }]}
        />
        <SearchWrapper>
          <Input
            placeholder="Search hubs..."
            className="font13"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={
              <SearchIcon
                sx={{
                  fontSize: 14,
                  marginRight: 1,
                  color: "grey",
                }}
              />
            }
          />
        </SearchWrapper>
      </TitleWrapper>

      <ContentWrapper className="flex gap20">
        <MainContent className="flexGrow">
          <GridWrapper>
            {hubList.map((hub) => (
              <HubCard 
                key={hub.id}
                hub={hub} 
                userMemberships={userMemberships}
                onMembershipUpdate={handleMembershipUpdate}
              />
            ))}
          </GridWrapper>
          
          {loading && (
            <div className="flexCenter p20">
              <div>Loading more hubs...</div>
            </div>
          )}

          {totalCount > pageSize && (
            <PaginationWrapper className="flexCenter">
              <Pagination
                current={currentPage}
                total={totalCount}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} hubs`
                }
              />
            </PaginationWrapper>
          )}
        </MainContent>

        {/* SIDEBAR */}
        <Sidebar className="flexColumn gap15">
          <div className="radius10 whiteBg" style={{ padding: "10px 15px" }}>
            <SectionTitle
              title="Hub Calendar"
              subtitle="Upcoming hub activities"
            />
          </div>
          <CalendarView />
          <div className="whiteBg radius10 p20">
            <div className="greyColor font12 text-center">
              Select a hub to view activities
            </div>
          </div>
        </Sidebar>
      </ContentWrapper>
    </Wrapper>
  );
};

export default HubList;

const Wrapper = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const TitleWrapper = styled.div`
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
`;

const SearchWrapper = styled.div`
  min-width: 250px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Sidebar = styled.div`
  width: 300px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
    display: none; /* Hide sidebar completely on mobile/tablet */
  }
`;

const GridWrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 20px;
  align-items: start; /* Prevents stretching */

  /* Ensure minimum 3 columns on desktop */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  @media (min-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }

  @media (max-width: 1199px) and (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 899px) and (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const PaginationWrapper = styled.div`
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
`;



// import { Input, Tag } from "antd";
// import styled from "styled-components";
// import { HubCard } from "./HubCard";
// import { CalendarView } from "../../components/calender/CalendarView";
// import { SectionTitle } from "../../components/elements/Elements";
// import useTitle from "../../hooks/useTitle";
// import { secondaryColor } from "../../components/UI/Theme";
// import SearchIcon from "../../icons/SearchIcon";
// import { IHub } from "../Hub/Hub.interface";
// import { useEffect, useState } from "react";
// import { HubService } from "../Hub/Hub.service";
// import LoadingScreen from "../../components/LoadingScreen";

// const HubList = () => {
//   const [loading, setLoading] = useState(false);
//   useTitle("Grain Hubs");
//   const [hubList, setHubList] = useState<IHub[]>([]);

//   useEffect(() => {
//     async function fetchHubs() {
//       setLoading(true);
//       try {
//         const { results } = await HubService.getHubs({
//           active: true,
//         });
//         setHubList(results);
//       } catch (error) {
//         console.error("Error fetching Hubs:", error);
//       }
//       setLoading(false);
//     }
//     fetchHubs();
//   }, []);

//   if (loading) return <LoadingScreen />;

//   return (
//     <Wrapper className="flexColumn gap20">
//       <TitleWrapper className="flexSpaceCenter gap20">
//         <SectionTitle
//           title="Top Grain Hub"
//           subtitle="Grain Hubs to Deposit"
//           tags={[{ label: "2025", color: secondaryColor }]}
//         />
//         <div id="search">
//           <Input
//             placeholder="Search"
//             className="font13"
//             prefix={
//               <SearchIcon
//                 sx={{
//                   fontSize: 14,
//                   marginRight: 1,
//                   color: "grey",
//                 }}
//               />
//             }
//           />
//         </div>
//       </TitleWrapper>

//       <ContentWrapper className="flex gap20">
//         <GridWrapper className="flexGrow">
//           {hubList.map((hub) => (
//             <HubCard hub={hub} />
//           ))}
//         </GridWrapper>
//         {/* CALENDER */}
//         <div className="flexColumn gap15">
//           <div className="radius10 whiteBg" style={{ padding: "10px 15px" }}>
//             <SectionTitle
//               title="Hub Calendar"
//               subtitle="Hub products available for Hub"
//             />
//           </div>
//           <CalendarView />
//           <div className="whiteBg radius10 p20" style={{}}>
//             <div className="greyColor font12">No selected Hub</div>
//           </div>
//         </div>
//       </ContentWrapper>
//     </Wrapper>
//   );
// };

// export default HubList;

// const Wrapper = styled.div`
//   padding: 20px 0;
// `;

// const ContentWrapper = styled.div`
//   @media (max-width: 960px) {
//     flex-direction: column;
//   }
// `;

// const TitleWrapper = styled.div`
//   @media (max-width: 960px) {
//     flex-direction: column;
//     #search {
//       width: 100%;
//     }
//   }
// `;

// export const GridWrapper = styled.div`
//   display: grid;
//   gap: 25px;
//   grid-template-columns: repeat(3, 1fr);

//   @media (max-width: 1180px) {
//     grid-template-columns: repeat(2, 1fr);
//   }

//   @media (max-width: 960px) {
//     grid-template-columns: 1fr;
//   }
// `;
