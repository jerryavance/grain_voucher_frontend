import { FC } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { IBuyInvestmentProps } from "./Investment.interface";
import { InvestmentService } from "./Investment.service";
import { EmojiEvents } from "@mui/icons-material";
import { primaryColor } from "../../components/UI/Theme";

interface BuyInvestmentFormProps extends IBuyInvestmentProps {
  investmentId: string;
  investmentName: string;
  handleCancel: () => void;
}

const BuyInvestmentForm: FC<BuyInvestmentFormProps> = ({
  handleRefreshInvestmentData,
  handleRefreshParticipantData,
  investmentId,
  investmentName,
  handleCancel,
}) => {
  const initialValues = {
    amount: "", // Changed from type to amount
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .typeError("Amount must be a number")
      .positive("Amount must be positive")
      .required("Amount is required"),
  });

  const handleBuyInvestmentSubmit = async (values: any) => {
    try {
      const response = await InvestmentService.buyInvestment(
        investmentId,
        values
      );
      console.log(response);
      toast.success("Bought Investment successfully");
      if (handleRefreshInvestmentData) handleRefreshInvestmentData();
      if (handleRefreshParticipantData) handleRefreshParticipantData();
    } catch (response: any) {
      toast.error(response?.data?.message || "Error buying Investment");
    }
  };

  const buyFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleBuyInvestmentSubmit,
  });

  return (
    <form onSubmit={buyFormik.handleSubmit} className="x100">
      <div className="flexCenter flexColumn gap15 p20 h100 whiteBg radius10">
        <EmojiEvents sx={{ fontSize: 40, fill: primaryColor }} />
        <div className="textDisabled regular font13">Buy Investment</div>
        <div className="font16 bold">{investmentName}</div>

        <TextField
          fullWidth
          id="amount"
          name="amount"
          label="Amount"
          type="number"
          placeholder="Enter investment amount"
          value={buyFormik.values.amount}
          onChange={buyFormik.handleChange}
          onBlur={buyFormik.handleBlur}
          error={buyFormik.touched.amount && Boolean(buyFormik.errors.amount)}
          helperText={buyFormik.touched.amount && buyFormik.errors.amount}
          InputProps={{
            inputProps: { min: 0 }
          }}
        />

        {/* BUTTONS */}
        <div className="flex gap10 x100">
          <Button variant="contained" fullWidth type="submit">
            Buy
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BuyInvestmentForm;