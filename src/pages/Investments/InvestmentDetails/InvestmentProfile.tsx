
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import useTitle from "../../../hooks/useTitle";
import { IInvestment } from "../InvestmentsList/Investment.interface";
import { InvestmentService } from "../InvestmentsList/Investment.service";
import { Tag } from "antd";
import { DetailsView } from "../../../components/Layouts/views/DetailsView";
import { primaryColor } from "../../../components/UI/Theme";
import { INVESTMENT_STATUS_PENDING, 
        INVESTMENT_STATUS_ACTIVE, 
        INVESTMENT_STATUS_COMPLETED, 
        INVESTMENT_STATUS_CANCELLED, 
        TYPE_ADMIN } from "../../../api/constants";


interface IProfileProps {
  investmentDetails: IInvestment | null | undefined;
}

type TMaskedEvent = {
  target: {
    value: string;
  };
};

const InvestmentProfile = ({ investmentDetails }: IProfileProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<
    IInvestment | null | undefined
  >(investmentDetails);

  useTitle("Investment Details");

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await InvestmentService.updateInvestment(
        editedDetails,
        investmentDetails?.id || ""
      );
      setIsEditing(false);
      // Optionally, you may want to refresh the user details after saving.
      // You can fetch updated details here if needed.
      const updatedInvestmentDetails =
        await InvestmentService.getInvestmentDetails(
          investmentDetails?.id || ""
        );
      setEditedDetails(updatedInvestmentDetails);
    } catch (error) {
      console.error("Error updating Investment:", error);
      // Handle error appropriately, e.g., display an error message to the user.
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedDetails((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (event: TMaskedEvent) => {
    const { value } = event.target;
    setEditedDetails((prevState: any) => ({
      ...prevState,
      status: value,
    }));
  };

  const handleDelete = async () => {
    try {
      await InvestmentService.deleteInvestment(investmentDetails?.id || "");
      // Redirect to the investment list page or any other appropriate page after deletion
      navigate("/admin/investment");
    } catch (error) {
      console.error("Error deleting investment:", error);
      // Handle error appropriately, e.g., display an error message to the user.
    }
  };

  const {
    investment_name,
    investment_bank,
    investment_type,
    investment_description,
    investment_code,
    total_investment_amount,
    available_units,
    unit_price,
    minimum_investment_amount,
    maximum_investment_amount,
    interest_rate,
    interest_type,
    investment_duration_value,
    investment_duration_unit,
    repayment_frequency,
    start_date,
    end_date,
    risk_level,
    guarantee_principal,
    collateral_type,
    collateral_value,
    platform_fee,
    early_termination_fee,
    withdrawal_before_maturity,
    transferability_of_units,
    currency,
    eligible_investor_type,
    investment_visibility,
    borrower_type,
    isin_number,
    issuer_name,
    issuer_country,
    issuer_website,
    issuer_email,
    issuer_phone_number,
    issuer_address,
    issuer_description,
    issuer_registration_number,
    issuer_tax_number,
    issuer_logo,
    credit_rating,
    esg_rating,
    loan_purpose,
    investment_image,
    terms_and_conditions,
    kyc_required,
    status, // Include Status
    updated_at,
    participant_details
  } = investmentDetails || {};


  const investmentFields = [
    { label: "Investment Name", value: investment_name, field: "investment_name" },
    { label: "Investment Bank", value: investment_bank, field: "investment_bank" },
    { label: "Investment Type", value: investment_type, field: "investment_type" },
    { label: "Investment Description", value: investment_description, field: "investment_description" },
    { label: "Investment Code", value: investment_code, field: "investment_code" },
    { label: "Total Investment Amount", value: total_investment_amount, field: "total_investment_amount" },
    { label: "Available Units", value: available_units, field: "available_units" },
    { label: "Unit Price", value: unit_price, field: "unit_price" },
    { label: "Minimum Investment Amount", value: minimum_investment_amount, field: "minimum_investment_amount" },
    { label: "Maximum Investment Amount", value: maximum_investment_amount, field: "maximum_investment_amount" },
    { label: "Interest Rate", value: interest_rate, field: "interest_rate" },
    { label: "Interest Type", value: interest_type, field: "interest_type" },
    { label: "Investment Duration Value", value: investment_duration_value, field: "investment_duration_value" },
    { label: "Investment Duration Unit", value: investment_duration_unit, field: "investment_duration_unit" },
    { label: "Repayment Frequency", value: repayment_frequency, field: "repayment_frequency" },
    { label: "Start Date", value: formatDateToDDMMYYYY(start_date || new Date().toDateString()), field: "start_date" },
    { label: "End Date", value: formatDateToDDMMYYYY(end_date || new Date().toDateString()), field: "end_date" },
    { label: "Risk Level", value: risk_level, field: "risk_level" },
    { label: "Guarantee Principal", value: guarantee_principal, field: "guarantee_principal" },
    { label: "Collateral Type", value: collateral_type, field: "collateral_type" },
    { label: "Collateral Value", value: collateral_value, field: "collateral_value" },

    { label: "Currency", value: currency, field: "currency" },
    { label: "Eligible Investor Type", value: eligible_investor_type, field: "eligible_investor_type" },
    { label: "Investment Visibility", value: investment_visibility, field: "investment_visibility" },
    { label: "Borrower Type", value: borrower_type, field: "borrower_type" },
    { label: "ISIN Number", value: isin_number, field: "isin_number" },
    { label: "Issuer Name", value: issuer_name, field: "issuer_name" },
    { label: "Issuer Country", value: issuer_country, field: "issuer_country" },
    { label: "Issuer Website", value: issuer_website, field: "issuer_website" },
    { label: "Issuer Email", value: issuer_email, field: "issuer_email" },
    { label: "Issuer Phone Number", value: issuer_phone_number, field: "issuer_phone_number" },
    { label: "Issuer Address", value: issuer_address, field: "issuer_address" },
    { label: "Issuer Description", value: issuer_description, field: "issuer_description" },
    { label: "Issuer Registration Number", value: issuer_registration_number, field: "issuer_registration_number" },
    { label: "Issuer Tax Number", value: issuer_tax_number, field: "issuer_tax_number" },
    { label: "Issuer Logo", value: issuer_logo, field: "issuer_logo" },
    { label: "Credit Rating", value: credit_rating, field: "credit_rating" },
    { label: "ESG Rating", value: esg_rating, field: "esg_rating" },
    { label: "Loan Purpose", value: loan_purpose, field: "loan_purpose" },
    { label: "Investment Image", value: investment_image, field: "investment_image" },
    { label: "Terms and Conditions", value: terms_and_conditions, field: "terms_and_conditions" },
    { label: "KYC Required", value: kyc_required, field: "kyc_required" },
    { label: "Status", value: status, field: "status" },
    { label: "Updated At", value: updated_at, field: "updated_at" },
    { label: "Participant Details", value: participant_details, field: "participant_details" },
  ];

  const paymentFields = [
    { label: "Platform Fee", value: platform_fee, field: "platform_fee" },
    {
      label: "Investment Status",
      value: <Tag color={primaryColor}>{status}</Tag>,
    },
  ];

  const settingFields = [
    
    { label: "Early Termination Fee", value: early_termination_fee, field: "early_termination_fee" },
    { label: "Withdrawal Before Maturity", value: withdrawal_before_maturity, field: "withdrawal_before_maturity" },
    { label: "Transferability of Units", value: transferability_of_units, field: "transferability_of_units" },
  ];
  

  return (
    <div className="flexColumn gap20">
      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Investment Information"}
          items={investmentFields}
          isEditable={ [INVESTMENT_STATUS_PENDING, INVESTMENT_STATUS_ACTIVE].includes(investmentDetails?.status || "") && [TYPE_ADMIN].includes(investmentDetails?.participant_details?.type || "") }
        />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView 
          title={"Investment Settings"} 
          items={settingFields} 
          isEditable={[TYPE_ADMIN].includes(investmentDetails?.participant_details?.type || "")} 
      />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView 
          title={"Registration & Payment"} 
          items={paymentFields} 
          isEditable={ [INVESTMENT_STATUS_PENDING, INVESTMENT_STATUS_ACTIVE].includes(investmentDetails?.status || "") && [TYPE_ADMIN].includes(investmentDetails?.participant_details?.type ||"")}
        />
      </div>
    </div>
  );
};


export default InvestmentProfile;
