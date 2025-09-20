import { useEffect, useState } from "react";
import useTitle from "../../../hooks/useTitle";
import { IInvestment } from "../Investment.interface";
import { InvestmentService } from "../Investment.service";
import LoadingScreen from "../../../components/LoadingScreen";
import { Input } from "antd";
import SearchIcon from "../../../icons/SearchIcon";
import styled from "styled-components";
import { PastInvestmentCard } from "./PastInvestmentCard";

const PastInvestments = () => {
    const [loading, setLoading] = useState(true);
    const [investmentList, setInvestmentList] = useState<IInvestment[]>([]);

    useTitle('Past Investments')


  useEffect(() => {
    fetchInvestments();
  }, []);

  async function fetchInvestments() {
    setLoading(true);
    try {
      const { results } = await InvestmentService.getInvestments({active: false, mine: true});
      setInvestmentList(results);
    } catch (error) {
      console.error("Error fetching Investments:", error);
    }
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;
    
  return (
    <Wrapper className="flexColumn gap20">
      <TitleWrapper className="flexSpaceCenter gap20">

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
            <PastInvestmentCard investment={investment} />
          ))}
        </GridWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}

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

const GridWrapper = styled.div`
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(5, 1fr);

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export default PastInvestments;
