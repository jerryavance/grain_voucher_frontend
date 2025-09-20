import { Box, Button, Card, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { CheckCircle } from "@mui/icons-material";
import { ILeaveInvestmentProps } from "../InvestmentsList/Investment.interface";
import {
  PARTICIPATION_STATUS_ACTIVE,
  PARTICIPATION_STATUS_MATURED,
  PARTICIPATION_STATUS_LIQUIDATED,
  TYPE_ADMIN,
} from "../../../api/constants";

import { INVESTMENT_STATUS_ACTIVE, INVESTMENT_STATUS_CANCELLED, INVESTMENT_STATUS_COMPLETED, INVESTMENT_STATUS_PENDING } from "../../../api/constants";
import SelectInput2 from "../../../components/UI/FormComponents/SelectInput2";
import { useFormik } from "formik";
import { ParticipantsService } from "./Participant.service";

const initialValues = { status: "" };

const validationSchema = Yup.object().shape({
  status: Yup.string().required("This field is Required!"),
});

const ParticipantStatusForm = (props: ILeaveInvestmentProps) => {
  const {
    participantDetails,
    handleRefreshParticipantData,
    handleRefreshInvestmentData,
    investmentDetails
  } = props;

  const handleParticipationStatus = async (values: any) => {
    try {
      await ParticipantsService.updateStatus(participantDetails?.id || "", values);
      toast.success("Investment Updated successfully");
      if (handleRefreshInvestmentData) handleRefreshInvestmentData();
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
            "The fields Investment, user must make a unique set."
          )
        ) {
          toast.error("You are not a participant in this Investment");
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
    ...(investmentDetails?.status === INVESTMENT_STATUS_PENDING ? [{ value: INVESTMENT_STATUS_ACTIVE, label: "Activate Investment" }] : []), // Only activate investment if it is pending
    ...(investmentDetails?.status === INVESTMENT_STATUS_ACTIVE ? [{ value: INVESTMENT_STATUS_COMPLETED, label: "Complete Investment" }, { value: INVESTMENT_STATUS_CANCELLED, label: "Cancel Investment" }] : []), // Complete or cancel investment if it is active
    ...(investmentDetails?.status === INVESTMENT_STATUS_COMPLETED ? [{ value: INVESTMENT_STATUS_CANCELLED, label: "Cancel Investment" }] : []), // Cancel investment if it is completed
    ...(investmentDetails?.status === INVESTMENT_STATUS_CANCELLED ? [{ value: INVESTMENT_STATUS_COMPLETED, label: "Reopen Investment" }] : []) // Reopen investment if it is cancelled
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
              You are part of this investment as {participantDetails?.type} (<span style={{ textTransform: 'capitalize'}}>{participantDetails?.status}</span>)
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
