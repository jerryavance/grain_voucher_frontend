import { FC } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { IFundLoanProps } from "./Loan.interface";
import { LoanService } from "./Loan.service";
import { EmojiEvents } from "@mui/icons-material";
import { primaryColor } from "../../components/UI/Theme";

interface FundLoanFormProps extends IFundLoanProps {
  loanId: string;
  loanName: string;
  handleCancel: () => void;
}

const FundLoanForm: FC<FundLoanFormProps> = ({
  handleRefreshLoanData,
  handleRefreshParticipantData,
  loanId,
  loanName,
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

  const handleFundLoanSubmit = async (values: any) => {
    try {
      const response = await LoanService.fundLoan(
        loanId,
        // values
      );
      console.log(response);
      toast.success("Bought Loan successfully");
      if (handleRefreshLoanData) handleRefreshLoanData();
      if (handleRefreshParticipantData) handleRefreshParticipantData();
    } catch (response: any) {
      toast.error(response?.data?.message || "Error Funding Loan");
    }
  };

  const fundFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFundLoanSubmit,
  });

  return (
    <form onSubmit={fundFormik.handleSubmit} className="x100">
      <div className="flexCenter flexColumn gap15 p20 h100 whiteBg radius10">
        <EmojiEvents sx={{ fontSize: 40, fill: primaryColor }} />
        <div className="textDisabled regular font13">Fund Loan</div>
        <div className="font16 bold">{loanName}</div>

        <TextField
          fullWidth
          id="amount"
          name="amount"
          label="Amount"
          type="number"
          placeholder="Enter Loan amount"
          value={fundFormik.values.amount}
          onChange={fundFormik.handleChange}
          onBlur={fundFormik.handleBlur}
          error={fundFormik.touched.amount && Boolean(fundFormik.errors.amount)}
          helperText={fundFormik.touched.amount && fundFormik.errors.amount}
          InputProps={{
            inputProps: { min: 0 }
          }}
        />

        {/* BUTTONS */}
        <div className="flex gap10 x100">
          <Button variant="contained" fullWidth type="submit">
            Fund
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FundLoanForm;