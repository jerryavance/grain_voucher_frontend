import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import useTitle from "../../../hooks/useTitle";
import { IDeposit } from "../Deposit.interface";
import { DepositService } from "../Deposit.service";
import { Tag } from "antd";
import { DetailsView } from "../../../components/Layouts/views/DetailsView";
import { primaryColor } from "../../../components/UI/Theme";

interface IProfileProps {
  depositDetails: IDeposit | null | undefined;
}

type TMaskedEvent = {
  target: {
    value: string;
  };
};

const DepositProfile = ({ depositDetails }: IProfileProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<IDeposit | null | undefined>(
    depositDetails
  );

  useTitle("Deposit Details");

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      if (!editedDetails || !depositDetails?.id) {
        throw new Error("Missing deposit details or ID.");
      }
      await DepositService.partialUpdateDeposit(editedDetails, depositDetails.id);
      setIsEditing(false);
      const updatedDepositDetails = await DepositService.getDepositDetails(
        depositDetails.id
      );
      setEditedDetails(updatedDepositDetails);
    } catch (error) {
      console.error("Error updating deposit:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedDetails((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleValidationChange = (event: TMaskedEvent) => {
    const { value } = event.target;
    setEditedDetails((prevState: any) => ({
      ...prevState,
      validated: value === 'true',
    }));
  };

  const handleDelete = async () => {
    try {
      await DepositService.deleteDeposit(depositDetails?.id || "");
      navigate("/admin/deposits");
    } catch (error) {
      console.error("Error deleting deposit:", error);
    }
  };

  const {
    id,
    farmer,
    hub,
    agent,
    grain_type,
    quantity_kg,
    moisture_level,
    quality_grade,
    deposit_date,
    validated,
    grn_number,
    notes,
    calculated_value,
    created_at,
    updated_at,
  } = depositDetails || {};

  // Get display names for foreign key relationships
  const farmerName = typeof farmer === 'object' ? farmer.name : 'N/A';
  const hubName = typeof hub === 'object' ? hub.name : 'N/A';
  const agentName = typeof agent === 'object' && agent ? agent.name : 'No Agent';
  const grainTypeName = typeof grain_type === 'object' ? grain_type.name : 'N/A';
  const qualityGradeName = typeof quality_grade === 'object' ? quality_grade.name : 'N/A';

  const depositFields = [
    { label: "Deposit ID", value: id, field: "id" },
    {
      label: "GRN Number",
      value: grn_number || "Not assigned",
      field: "grn_number",
    },
    {
      label: "Farmer",
      value: farmerName,
      field: "farmer",
    },
    {
      label: "Hub",
      value: hubName,
      field: "hub",
    },
    {
      label: "Agent",
      value: agentName,
      field: "agent",
    },
    {
      label: "Grain Type",
      value: grainTypeName,
      field: "grain_type",
    },
    {
      label: "Quality Grade",
      value: qualityGradeName,
      field: "quality_grade",
    },
    {
      label: "Deposit Date",
      value: deposit_date ? formatDateToDDMMYYYY(deposit_date) : "N/A",
      field: "deposit_date",
    },
  ];

  const quantityFields = [
    {
      label: "Quantity (KG)",
      value: quantity_kg ? `${parseFloat(quantity_kg.toString()).toLocaleString()} kg` : "0 kg",
      field: "quantity_kg",
    },
    {
      label: "Moisture Level",
      value: moisture_level ? `${moisture_level}%` : "N/A",
      field: "moisture_level",
    },
    {
      label: "Calculated Value",
      value: calculated_value 
        ? `$${parseFloat(calculated_value.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : "Not calculated",
      field: "calculated_value",
    },
    {
      label: "Validation Status",
      value: (
        <Tag color={validated ? "green" : "orange"}>
          {validated ? "Validated" : "Pending Validation"}
        </Tag>
      ),
    },
  ];

  const settingFields = [
    {
      label: "Validated",
      value: validated ? "Yes" : "No",
      field: "validated",
      isEditable: true,
      onChange: handleValidationChange,
    },
    {
      label: "Notes",
      value: notes || "No notes",
      field: "notes",
      isEditable: true,
    },
    {
      label: "Created At",
      value: created_at ? formatDateToDDMMYYYY(created_at) : "N/A",
      field: "created_at",
    },
    {
      label: "Updated At",
      value: updated_at ? formatDateToDDMMYYYY(updated_at) : "N/A",
      field: "updated_at",
    },
  ];

  return (
    <div className="flexColumn gap20">
      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Deposit Information"}
          items={depositFields}
          isEditable={false} // Basic deposit info shouldn't be editable
        />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Quantity & Quality"}
          items={quantityFields}
          isEditable={!validated} // Only editable if not validated
        />
      </div>

      <div className="radius10 whiteBg p20">
        <DetailsView
          title={"Validation & Notes"}
          items={settingFields}
          isEditable={true}
        />
      </div>
    </div>
  );
};

export default DepositProfile;