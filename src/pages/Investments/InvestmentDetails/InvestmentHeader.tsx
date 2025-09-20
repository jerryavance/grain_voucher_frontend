import { Button } from "@mui/material";
import {TEAM_REQUESTS } from "../../../api/constants";
import Visibility from "../../../components/UI/Visibility";
import { stringify } from "../../../utils/helpers";
import {IsThisInvestmentTabMaster } from "../../../utils/permissions";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import { StatusTag } from "../../../components/elements/Elements";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Dropdown, MenuProps } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import styled from "styled-components";


export const InvestmentHeader = ({
  InvestmentDetails,
  handleStartInvestment,
  setShowModal,
  startInvestment,
}: {
  InvestmentDetails: any;
  handleStartInvestment: any;
  setShowModal: any;
  startInvestment: any;
}) => {
  const {
    name,
    investment_name,
    status_display,
    start_date,
    end_date,
    interest_rate,
  } = InvestmentDetails || {};
  const navigate = useNavigate();
  const { investmentId, tabId } = useParams();

  const openRequests = () => {
    const route = `/investments/details/${investmentId}/${TEAM_REQUESTS}`;
    navigate(route);
  };

  const actionItems = [
    {
      key: TEAM_REQUESTS,
      label: "Request",
    },
  ];

  const onClick = ({ key }: any) => {
    switch (key) {
      case TEAM_REQUESTS:
        openRequests();
        break;

      default:
        break;
    }
    console.log(key);
  };

  const headerFields: any = {
    name: investment_name,
    start_date: moment(start_date).format("ll"),
    end_date: moment(end_date).format("ll"),
    interest: interest_rate,
  };

  return (
    <div>
      <ConfirmPrompt
        handleClose={() => setShowModal(false)}
        title="Start Investment"
        text="Are you sure you want to start the Investment?"
        handleOk={startInvestment}
      />
      <div className="whiteBg radius10 p20 flexSpaceCenter">
        {/* MAIN */}
        <div>
          <div className="flexNullCenter gap15">
            <div className="bold font16">{name}</div>
            <StatusTag status={status_display} />
          </div>

          <HeaderFieldsWrapper className="flexNullCenter gap10 flexWrap">
            {Object.keys(headerFields).map((fieldName, i) => {
              const hasDivider = i < Object.keys(headerFields).length - 1;
              return (
                <div
                  className="font12 mt5 gap5 flexNullCenter capitalize"
                  style={{
                    paddingRight: 10,
                    borderRight: hasDivider ? "1px solid #ccc" : 0,
                  }}
                >
                  <span className="semiBold greyColor">
                    {stringify(fieldName)}:
                  </span>
                  <div>{headerFields?.[fieldName]}</div>
                </div>
              );
            })}
          </HeaderFieldsWrapper>
        </div>
        {/* END */}
        <div className="gap10 flexNullCenter">
          <Dropdown
            menu={{
              items: actionItems as MenuProps["items"],
              onClick,
            }}
          >
            <Button
              sx={{ bgcolor: "#f2f2f2", px: 1.5 }}
              endIcon={<KeyboardArrowDown />}
            >
              Actions
            </Button>
          </Dropdown>

          <Visibility
            visible={IsThisInvestmentTabMaster(InvestmentDetails as any) }
          >
            <Button onClick={handleStartInvestment} variant="contained">
              Start Investment
            </Button>
          </Visibility>
        </div>
      </div>
    </div>
  );
};

const HeaderFieldsWrapper = styled.div`
  margin-top: 5px;
  @media (max-width: 960px) {
    gap: 0;
  }
`;
