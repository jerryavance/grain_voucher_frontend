import { Button } from "@mui/material";
import Visibility from "../../../components/UI/Visibility";
import { stringify } from "../../../utils/helpers";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import { StatusTag } from "../../../components/elements/Elements";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import styled from "styled-components";
import { capitalizeFirstLetter } from "../../../utils/helpers";
import { IDeposit } from "../Deposit.interface";

export const DepositHeader = ({
  depositDetails,
  handleValidateDeposit,
  setShowValidateModal,
  validateDeposit,
  showValidateModal,
}: {
  depositDetails: IDeposit | null | undefined;
  handleValidateDeposit: any;
  setShowValidateModal: any;
  validateDeposit: any;
  showValidateModal?: boolean;
}) => {
  const {
    grn_number,
    farmer,
    hub,
    grain_type,
    quantity_kg,
    quality_grade,
    moisture_level,
    validated,
    deposit_date,
    created_at,
    updated_at,
    calculated_value,
    agent,
  } = depositDetails || {};
  
  const navigate = useNavigate();
  const { depositId, tabId } = useParams();

  // Get display names for foreign key relationships
  const farmerName = typeof farmer === 'object' ? farmer.name : 'N/A';
  const hubName = typeof hub === 'object' ? hub.name : 'N/A';
  const grainTypeName = typeof grain_type === 'object' ? grain_type.name : 'N/A';
  const qualityGradeName = typeof quality_grade === 'object' ? quality_grade.name : 'N/A';
  const agentName = typeof agent === 'object' && agent ? agent.name : 'No Agent';

  const headerFields: any = {
    farmer: farmerName,
    hub: hubName,
    grain_type: grainTypeName,
    quantity: quantity_kg ? `${quantity_kg} kg` : 'N/A',
    moisture_level: moisture_level ? `${moisture_level}%` : 'N/A',
    quality_grade: qualityGradeName,
    deposit_date: moment(deposit_date).format("ll"),
    created_at: moment(created_at).format("ll"),
    calculated_value: calculated_value ? `$${parseFloat(calculated_value.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
  };

  // Check if deposit can be validated (not already validated)
  const canValidateDeposit = !validated;

  return (
    <div>
      {/* Validate Modal */}
      <ConfirmPrompt
        open={showValidateModal}
        handleClose={() => setShowValidateModal(false)}
        title="Validate Deposit"
        text="Are you sure you want to validate this deposit? This action confirms the grain quality and quantity."
        handleOk={validateDeposit}
      />

      <div className="whiteBg radius10 p20 flexSpaceCenter">
        {/* MAIN */}
        <div>
          <div className="flexNullCenter gap15">
            <div className="bold font16">
              {grn_number || `DEP-${depositId?.slice(-8)}`}
            </div>
            <StatusTag status={validated ? 'validated' : 'pending'} />
            {agent && (
              <div className="font12 greyColor">
                Agent: {agentName}
              </div>
            )}
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
                    {stringify(fieldName).replace('_', ' ')}:
                  </span>
                  <div>{headerFields?.[fieldName]}</div>
                </div>
              );
            })}
          </HeaderFieldsWrapper>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="gap10 flexNullCenter">
          <Visibility visible={canValidateDeposit}>
            <Button onClick={handleValidateDeposit} variant="contained" color="success">
              Validate Deposit
            </Button>
          </Visibility>
          
          {/* Future action buttons can be added here */}
          {/* 
          <Button variant="outlined" color="primary">
            Generate Receipt
          </Button>
          <Button variant="outlined" color="warning">
            Mark as Processed
          </Button>
          */}
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