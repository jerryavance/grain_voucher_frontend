import { Input, Tag } from "antd";
import styled from "styled-components";
import { InvestmentCard } from "../Dashboards/InvestmentCard";
import { CalendarView } from "../../../components/calender/CalendarView";
import { SectionTitle } from "../../../components/elements/Elements";
import useTitle from "../../../hooks/useTitle";
import { secondaryColor } from "../../../components/UI/Theme";
import SearchIcon from "../../../icons/SearchIcon";
import { IInvestment } from "../Investment.interface";
import { useEffect, useState } from "react";
import { InvestmentService } from "../Investment.service";
import LoadingScreen from "../../../components/LoadingScreen";

const InvestmentsListDashboard = () => {
  const [loading, setLoading] = useState(false);
  useTitle("Investement Products");
  const [investmentList, setInvestmentList] = useState<IInvestment[]>([]);

  useEffect(() => {
    async function fetchInvestments() {
      setLoading(true);
      try {
        const { results } = await InvestmentService.getInvestments({
          active: true,
        });
        setInvestmentList(results);
      } catch (error) {
        console.error("Error fetching Investments:", error);
      }
      setLoading(false);
    }
    fetchInvestments();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Wrapper className="flexColumn gap20">
      <TitleWrapper className="flexSpaceCenter gap20">
        <SectionTitle
          title="Top Investment Products"
          subtitle="Investment products available for investment"
          tags={[{ label: "2025", color: secondaryColor }]}
        />
        <div id="search">
          <Input
            placeholder="Search"
            className="font13"
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
        </div>
      </TitleWrapper>

      {/* CONTENT */}
      <ContentWrapper className="flex gap20">
        {/* GRID */}
        <GridWrapper className="flexGrow">
          {investmentList.map((investment) => (
            <InvestmentCard investment={investment} />
          ))}
        </GridWrapper>
        {/* CALENDER */}
        <div className="flexColumn gap15">
          <div className="radius10 whiteBg" style={{ padding: "10px 15px" }}>
            <SectionTitle
              title="Investment Calendar"
              subtitle="Investment products available for investment"
            />
          </div>
          <CalendarView />
          <div className="whiteBg radius10 p20" style={{}}>
            <div className="greyColor font12">No selected Investment</div>
          </div>
        </div>
      </ContentWrapper>
    </Wrapper>
  );
};

export default InvestmentsListDashboard;

const Wrapper = styled.div`
  padding: 20px 0;
`;

const ContentWrapper = styled.div`
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const TitleWrapper = styled.div`
  @media (max-width: 960px) {
    flex-direction: column;
    #search {
      width: 100%;
    }
  }
`;

export const GridWrapper = styled.div`
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;
