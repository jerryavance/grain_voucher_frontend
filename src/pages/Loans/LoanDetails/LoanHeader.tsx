import { Button } from "@mui/material";
import {TEAM_REQUESTS } from "../../../api/constants";
import Visibility from "../../../components/UI/Visibility";
import { stringify } from "../../../utils/helpers";
import {IsThisLoanTabMaster } from "../../../utils/permissions";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import { StatusTag } from "../../../components/elements/Elements";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Dropdown, MenuProps } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import styled from "styled-components";
import { capitalizeFirstLetter } from "../../../utils/helpers";
import { useState } from "react";

export const LoanHeader = ({
  LoanDetails,
  handleApproveLoan,
  handleRejectLoan,
  setShowModal,
  setShowRejectModal,
  ApproveLoan,
  RejectLoan,
  showModal,
  showRejectModal,
}: {
  LoanDetails: any;
  handleApproveLoan: any;
  handleRejectLoan: any;
  setShowModal: any;
  setShowRejectModal: any;
  ApproveLoan: any;
  RejectLoan: any;
  showModal?: boolean;
  showRejectModal?: boolean;
}) => {
  const {
    name,
    loan_name,
    status,
    loan_duration,
    risk_tier,
    purpose,
    approved_at,
    created_at,
    updated_at,
    interest_rate,
  } = LoanDetails || {};
  const navigate = useNavigate();
  const { loanId, tabId } = useParams();

  const openRequests = () => {
    const route = `/loan/details/${loanId}/${TEAM_REQUESTS}`;
    navigate(route);
  };

  const headerFields: any = {
    name: loan_name,
    Approve_date: moment(approved_at).format("ll"),
    created_at: moment(created_at).format("ll"),
    updated_at: moment(updated_at).format("ll"),
    interest: interest_rate,
    duration: loan_duration ? `${loan_duration} days` : "N/A",
    purpose: purpose || "N/A",
  };

  // Check if loan can be approved or rejected (typically pending status)
  const canModifyLoan = status === 'pending' || status === 'under_review';

  return (
    <div>
      {/* Approve Modal */}
      <ConfirmPrompt
        open={showModal}
        handleClose={() => setShowModal(false)}
        title="Approve Loan"
        text="Are you sure you want to Approve the Loan?"
        handleOk={ApproveLoan}
      />
      
      {/* Reject Modal */}
      <ConfirmPrompt
        open={showRejectModal}
        handleClose={() => setShowRejectModal(false)}
        title="Reject Loan"
        text="Are you sure you want to Reject the Loan? This action cannot be undone."
        handleOk={RejectLoan}
      />

      <div className="whiteBg radius10 p20 flexSpaceCenter">
        {/* MAIN */}
        <div>
          <div className="flexNullCenter gap15">
            <div className="bold font16">{name}</div>
            <StatusTag status={status} />
          </div>

          <HeaderFieldsWrapper className="flexNullCenter gap10 flexWrap">
            {Object.keys(headerFields).map((fieldName, i) => {
              const hasDivider = i < Object.keys(headerFields).length - 1;
              return (
                <div
                  key={fieldName}
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
        
        {/* ACTION BUTTONS */}
        <div className="gap10 flexNullCenter">
          <Visibility
            // visible={IsThisLoanTabMaster(LoanDetails as any) && canModifyLoan}
            visible={canModifyLoan} // for testing purposes
          >
            <Button 
              onClick={handleRejectLoan} 
              variant="outlined" 
              color="error"
              style={{ marginRight: '10px' }}
            >
              Reject Loan
            </Button>
            <Button onClick={handleApproveLoan} variant="contained">
              Approve Loan
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