import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Chip, Avatar, Tabs, Tab, Box } from "@mui/material";
import styled from "styled-components";
import { 
  ArrowBack, 
  LocationOn, 
  Person, 
  Phone, 
  CheckCircle,
  Schedule,
  Group,
  Info,
  People
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import { IHub } from "../Hub/Hub.interface";
import { HubService } from "../Hub/Hub.service";
import { membershipService, MembershipService } from "../Membership/HubMembership.service";
import LoadingScreen from "../../components/LoadingScreen";
import JoinHubForm from "./JoinHubForm";
import HubMembership from "../Membership/HubMembership";
import { primaryColor, secondaryColor } from "../../components/UI/Theme";
import useAuth from "../../hooks/useAuth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hub-tabpanel-${index}`}
      aria-labelledby={`hub-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const HubDetails = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hub, setHub] = useState<IHub | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  // Check if current user is hub admin
  const isHubAdmin = user?.role === "hub_admin";
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (hubId) {
      fetchHubDetails();
      checkMembershipStatus();
    }
  }, [hubId]);

  const fetchHubDetails = async () => {
    try {
      setLoading(true);
      const response = await HubService.getHubDetails(hubId!);
      setHub(response);
    } catch (error) {
      console.error("Error fetching hub details:", error);
      toast.error("Failed to load hub details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkMembershipStatus = async () => {
    try {
      const hubMembership = await membershipService.checkHubMembership(hubId!);
      
      if (hubMembership) {
        setIsMember(hubMembership.status === 'active');
        setMembershipStatus(hubMembership.status);
      } else {
        setIsMember(false);
        setMembershipStatus('');
      }
    } catch (error) {
      console.error("Error checking membership status:", error);
    }
  };

  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    setMembershipStatus('pending');
    checkMembershipStatus();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) return <LoadingScreen />;
  if (!hub) return <div>Hub not found</div>;

  return (
    <Wrapper>
      {/* Header */}
      <HeaderSection>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ marginBottom: 2 }}
        >
          Back to Hubs
        </Button>
        
        <HeaderImage>
          <img
            src="/static/background/user-cover-pic.png"
            alt="Hub Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <HeaderOverlay />
          <HeaderContent>
            <HubTitle>{hub.name}</HubTitle>
            <HubLocation>
              <LocationOn sx={{ fontSize: 18, marginRight: 1 }} />
              {hub.location}
            </HubLocation>
          </HeaderContent>
        </HeaderImage>
      </HeaderSection>

      {/* Content */}
      <ContentSection>
        <TabsCard>
          <StyledTabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="hub details tabs"
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <StyledTab 
              icon={<Info />} 
              label="Hub Info" 
              iconPosition="start"
            />
            {(isHubAdmin || isSuperAdmin) && (
              <StyledTab 
                icon={<People />} 
                label="Members" 
                iconPosition="start"
              />
            )}
          </StyledTabs>

          <TabPanel value={activeTab} index={0}>
            <TabContent>
              <MainContent>
                {/* Hub Info Card */}
                <InfoCard>
                  <CardHeader>
                    <h3>Hub Information</h3>
                    <Chip 
                      label={hub.is_active ? "Active" : "Inactive"}
                      color={hub.is_active ? "success" : "default"}
                      size="small"
                    />
                  </CardHeader>
                  
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Hub Name</InfoLabel>
                      <InfoValue>{hub.name}</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel>Location</InfoLabel>
                      <InfoValue>
                        <LocationOn sx={{ fontSize: 16, marginRight: 1 }} />
                        {hub.location}
                      </InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel>Created</InfoLabel>
                      <InfoValue>
                        <Schedule sx={{ fontSize: 16, marginRight: 1 }} />
                        {formatDate(hub.created_at)}
                      </InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel>Last Updated</InfoLabel>
                      <InfoValue>{formatDate(hub.updated_at)}</InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </InfoCard>

                {/* Hub Admin Card */}
                {hub.hub_admin && (
                  <InfoCard>
                    <CardHeader>
                      <h3>Hub Administrator</h3>
                    </CardHeader>
                    
                    <AdminInfo>
                      <Avatar sx={{ width: 60, height: 60, bgcolor: primaryColor }}>
                        <Person />
                      </Avatar>
                      <AdminDetails>
                        <AdminName>
                          {hub.hub_admin.first_name} {hub.hub_admin.last_name}
                        </AdminName>
                        <AdminContact>
                          <Phone sx={{ fontSize: 16, marginRight: 1 }} />
                          {hub.hub_admin.phone_number}
                        </AdminContact>
                      </AdminDetails>
                    </AdminInfo>
                  </InfoCard>
                )}
              </MainContent>

              {/* Sidebar */}
              <Sidebar>
                <ActionCard>
                  <h3>Membership</h3>
                  
                  {isMember ? (
                    <MembershipStatus>
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                      <span>You are a member of this hub</span>
                    </MembershipStatus>
                  ) : membershipStatus === 'pending' ? (
                    <MembershipStatus>
                      <Schedule sx={{ color: '#ff9800', fontSize: 20 }} />
                      <span>Application pending review</span>
                    </MembershipStatus>
                  ) : showJoinForm ? (
                    <JoinHubForm
                      hubId={hub.id}
                      hubName={hub.name}
                      handleCancel={() => setShowJoinForm(false)}
                      handleRefreshHubData={handleJoinSuccess}
                    />
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                        Join this hub to access grain trading opportunities and connect with other farmers.
                      </p>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setShowJoinForm(true)}
                        sx={{ backgroundColor: primaryColor }}
                      >
                        Apply to Join
                      </Button>
                    </div>
                  )}
                </ActionCard>

                {/* Stats Card */}
                <StatsCard>
                  <h3>Hub Statistics</h3>
                  <StatItem>
                    <Group sx={{ fontSize: 20, color: secondaryColor }} />
                    <div>
                      <StatLabel>Active Members</StatLabel>
                      <StatValue>-</StatValue>
                    </div>
                  </StatItem>
                </StatsCard>
              </Sidebar>
            </TabContent>
          </TabPanel>

          {(isHubAdmin || isSuperAdmin) && (
            <TabPanel value={activeTab} index={1}>
              <MembersTabContent>
                <HubMembership hubId={hubId} />
              </MembersTabContent>
            </TabPanel>
          )}
        </TabsCard>
      </ContentSection>
    </Wrapper>
  );
};

export default HubDetails;

// Styled Components
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 30px;
`;

const HeaderImage = styled.div`
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    height: 150px;
  }
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2));
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  
  @media (max-width: 768px) {
    bottom: 16px;
    left: 16px;
  }
`;

const HubTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const HubLocation = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentSection = styled.div`
  width: 100%;
`;

const TabsCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const StyledTabs = styled(Tabs)`
  border-bottom: 1px solid #f0f0f0;
  
  & .MuiTabs-flexContainer {
    @media (max-width: 576px) {
      flex-direction: row;
    }
  }
  
  & .MuiTab-root {
    text-transform: none;
    font-weight: 600;
    font-size: 0.9rem;
    min-height: 48px;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
      padding: 8px 12px;
    }
    
    @media (max-width: 576px) {
      min-width: 120px;
      font-size: 0.75rem;
      min-height: 44px;
    }
  }
`;

const StyledTab = styled(Tab)`
  @media (max-width: 576px) {
    & .MuiTab-iconWrapper {
      margin-bottom: 2px;
    }
    
    & svg {
      font-size: 18px;
    }
  }
`;

const TabContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`;

const MembersTabContent = styled.div`
  padding: 16px;
  
  /* Fix horizontal scroll on mobile for the table */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 12px;
    margin: -12px;
    
    /* Allow table to scroll horizontally */
    & table {
      min-width: 700px;
    }
    
    /* Make action buttons stack on mobile */
    & .MuiTableCell-root {
      white-space: nowrap;
      
      &:last-child {
        min-width: 120px;
      }
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 8px;
  }
  
  @media (max-width: 576px) {
    padding: 16px;
  }
`;

const ActionCard = styled(InfoCard)`
  h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const StatsCard = styled(InfoCard)`
  h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    flex: 1;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const AdminInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

const AdminDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AdminName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AdminContact = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  
  @media (max-width: 576px) {
    justify-content: center;
  }
`;

const MembershipStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 0.9rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;