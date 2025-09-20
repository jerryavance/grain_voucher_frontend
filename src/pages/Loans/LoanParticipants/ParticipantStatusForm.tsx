import { Box, Button, Card, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { CheckCircle } from "@mui/icons-material";
import { ILeaveLoanProps } from "../Loan.interface";
import {
  PARTICIPATION_STATUS_ACTIVE,
  PARTICIPATION_STATUS_MATURED,
  PARTICIPATION_STATUS_LIQUIDATED,
  TYPE_ADMIN,
} from "../../../api/constants";
import {
  LOAN_STATUS_ACTIVE,
  LOAN_STATUS_PENDING,
  LOAN_STATUS_FUNDED,
  LOAN_STATUS_REPAID,
  LOAN_STATUS_DEFAULTED,
  LOAN_STATUS_REJECTED,
} from "../../../constants/loan-options";
import SelectInput2 from "../../../components/UI/FormComponents/SelectInput2";
import { useFormik } from "formik";
import { ParticipantsService } from "./Participant.service";
import { IParticipants } from "./Participants.interface";

const initialValues = { status: "" };

const validationSchema = Yup.object().shape({
  status: Yup.string().required("This field is Required!"),
});

const ParticipantStatusForm = (props: ILeaveLoanProps) => {
  const {
    participantDetails,
    handleRefreshParticipantData,
    handleRefreshLoanData,
    loanDetails
  } = props;

  const handleParticipationStatus = async (values: any) => {
    try {
      await ParticipantsService.updateStatus(participantDetails?.id || "", values);
      toast.success("Loan Updated successfully");
      if (handleRefreshLoanData) handleRefreshLoanData();
      if (handleRefreshParticipantData) handleRefreshParticipantData();
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.non_field_errors
      ) {
        const errorMessages = error.response.data.non_field_errors;
        if (
          errorMessages.includes(
            "The fields Loan, user must make a unique set."
          )
        ) {
          toast.error("You are not a participant in this Loan");
        }
      }
    }
  };

  const statusFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleParticipationStatus,
  });

  const statuses = [
    ...(loanDetails?.status === LOAN_STATUS_PENDING
      ? [
          { value: LOAN_STATUS_FUNDED, label: "Fund Loan" },
          { value: LOAN_STATUS_REJECTED, label: "Reject Loan" }
        ]
      : []),
  
    ...(loanDetails?.status === LOAN_STATUS_FUNDED
      ? [{ value: LOAN_STATUS_ACTIVE, label: "Activate Loan" }]
      : []),
  
    ...(loanDetails?.status === LOAN_STATUS_ACTIVE
      ? [
          { value: LOAN_STATUS_REPAID, label: "Mark as Repaid" },
          { value: LOAN_STATUS_DEFAULTED, label: "Mark as Defaulted" }
        ]
      : []),
  
    ...(loanDetails?.status === LOAN_STATUS_REJECTED
      ? [{ value: LOAN_STATUS_PENDING, label: "Reopen Loan" }]
      : []),
  
    ...(loanDetails?.status === LOAN_STATUS_DEFAULTED
      ? [{ value: LOAN_STATUS_ACTIVE, label: "Reopen Loan" }]
      : []),
  
    ...(loanDetails?.status === LOAN_STATUS_REPAID
      ? [] // Repaid is terminal
      : []),
  ];
  

  return (
    <Box pb={4}>
      <Card sx={{ padding: 3, boxShadow: 2 }}>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <div
              className="title"
              style={{ fontWeight: "bold", marginTop: 10 }}
            >
              <CheckCircle
                style={{ color: "green", fontSize: 20, height: 40, width: 40 }}
              />{" "}
              You are part of this loan as {participantDetails?.type} (<span style={{ textTransform: 'capitalize'}}>{participantDetails?.type}</span>) 
            </div>
          </Grid>
          <Grid item sm={6} md={6} xs={6} flex={"end"}>
            {![TYPE_ADMIN]?.includes(
              participantDetails?.type || ""
            ) && (
              <form onSubmit={statusFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item sm={4} xs={12}>
                    <p style={{paddingTop: 12}}>Update Status</p>
                  </Grid>
                  <Grid item sm={4} xs={12}>
                    <SelectInput2
                      name="status"
                      value={statusFormik.values.status}
                      options={statuses}
                      placeholder="Select Status....."
                      formControl={statusFormik}
                      error={statusFormik?.errors?.["status"] as string}
                    />
                  </Grid>

                  <Grid item sm={4} xs={12}>
                    <Button type="submit" variant="contained">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default ParticipantStatusForm;
