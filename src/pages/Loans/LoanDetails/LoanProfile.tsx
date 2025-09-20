import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import useTitle from "../../../hooks/useTitle";
import { ILoan } from "../Loan.interface";
import { LoanService } from "../Loan.service";
import { Tag } from "antd";
import { DetailsView } from "../../../components/Layouts/views/DetailsView";
import { primaryColor } from "../../../components/UI/Theme";
import {
  LOAN_STATUS_PENDING,
  LOAN_STATUS_ACTIVE,
} from "../../../constants/loan-options";
import { TYPE_ADMIN } from "../../../api/constants";

interface IProfileProps {
  loanDetails: ILoan | null | undefined;
}

type TMaskedEvent = {
  target: {
    value: string;
  };
};

const LoanProfile = ({ loanDetails }: IProfileProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<ILoan | null | undefined>(
    loanDetails
  );

  useTitle("Loan Details");

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await LoanService.updateLoan(editedDetails, loanDetails?.id || "");
      setIsEditing(false);
      const updatedLoanDetails = await LoanService.getLoanDetails(
        loanDetails?.id || ""
      );
      setEditedDetails(updatedLoanDetails);
    } catch (error) {
      console.error("Error updating Loan:", error);
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
      await LoanService.deleteLoan(loanDetails?.id || "");
      navigate("/admin/loan");
    } catch (error) {
      console.error("Error deleting loan:", error);
    }
  };

  const {
    id,
    user,
    amount,
    purpose,
    loan_duration,
    payment_method,
    repayment_frequency,
    status,
    currency,
    risk_tier,
    is_approved,
    is_fully_funded,
    is_fully_paid,
    interest_type,
    interest_rate,
    interest_amount,
    remaining_balance,
    total_units,
    units_sold,
    units_available,
    approved_at,
    created_at,
  } = loanDetails || {};

  const loanFields = [
    { label: "Loan ID", value: id, field: "id" },
    {
      label: "Borrower",
      value:
        user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : "N/A",
      field: "borrower",
    },
    {
      label: "Amount",
      value: `${amount} ${currency || "UGX"}`,
      field: "amount",
    },
    { label: "Purpose", value: purpose || "N/A", field: "purpose" },
    {
      label: "Loan Duration",
      value: `${loan_duration} month(s)`,
      field: "loan_duration",
    },
    {
      label: "Payment Method",
      value: payment_method || "N/A",
      field: "payment_method",
    },
    {
      label: "Repayment Frequency",
      value: repayment_frequency || "N/A",
      field: "repayment_frequency",
    },
    {
      label: "Interest Type",
      value: interest_type || "N/A",
      field: "interest_type",
    },
    {
      label: "Interest Rate",
      value: `${interest_rate || "0"}%`,
      field: "interest_rate",
    },
    {
      label: "Interest Amount",
      value: `${interest_amount || "0"} ${currency || "UGX"}`,
      field: "interest_amount",
    },
    {
      label: "Remaining Balance",
      value: `${remaining_balance || "0"} ${currency || "UGX"}`,
      field: "remaining_balance",
    },
    {
      label: "Total Units",
      value: `${total_units || "0"} units`,
      field: "total_units",
    },
    {
      label: "Units Sold",
      value: `${units_sold || "0"} units`,
      field: "units_sold",
    },
    {
      label: "Units Available",
      value: `${units_available || "0"} units`,
      field: "units_available",
    },
  ];

  const paymentFields = [
    { label: "Risk Tier", value: risk_tier || "N/A", field: "risk_tier" },
    {
      label: "Is Fully Funded",
      value: is_fully_funded ? "Yes" : "No",
      field: "is_fully_funded",
    },
    {
      label: "Is Fully Paid",
      value: is_fully_paid ? "Yes" : "No",
      field: "is_fully_paid",
    },
    {
      label: "Loan Status",
      value: <Tag color={primaryColor}>{status}</Tag>,
    },
  ];

  const settingFields = [
    {
      label: "Is Approved",
      value: is_approved ? "Yes" : "No",
      field: "is_approved",
    },
    {
      label: "Status",
      value: status,
      field: "status",
      isEditable: true,
      onChange: handleStatusChange,
    },
  ];

  return (
    <div className="flexColumn gap20">
      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Loan Information"}
          items={loanFields}
          isEditable={
            [LOAN_STATUS_PENDING, LOAN_STATUS_ACTIVE].includes(
              loanDetails?.status || ""
            ) /* You can re-enable TYPE_ADMIN check if participant_details are added */
          }
        />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Loan Settings"}
          items={settingFields}
          isEditable={
            true /* Modify when participant_details.type is available */
          }
        />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Registration & Payment"}
          items={paymentFields}
          isEditable={
            [LOAN_STATUS_PENDING, LOAN_STATUS_ACTIVE].includes(
              loanDetails?.status || ""
            )
          }
        />
      </div>
    </div>
  );
};

export default LoanProfile;