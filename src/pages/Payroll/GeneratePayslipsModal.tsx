import React, { FC, useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress 
} from "@mui/material";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import { toast } from "react-hot-toast";
import { PayrollService } from "./Payroll.service";
import { Span } from "../../components/Typography";
import uniqueId from "../../utils/generateId";

interface IGeneratePayslipsModalProps {
  handleClose: () => void;
  callBack?: () => void;
}

const GeneratePayslipsModal: FC<IGeneratePayslipsModalProps> = ({
  handleClose,
  callBack,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>(
    new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
  );

  const handleGenerate = async () => {
    if (!period) {
      toast.error("Please select a period");
      return;
    }

    setLoading(true);
    try {
      await PayrollService.generateMonthlyPayslips(period);
      toast.success("Payslip generation initiated successfully");
      
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Failed to generate payslips");
    }
  };

  const handleReset = () => {
    setPeriod(new Date().toISOString().slice(0, 7));
    handleClose();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleGenerate}
          variant="contained"
          disabled={loading || !period}
        >
          {loading ? (
            <>
              <CircularProgress color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Generating...
              </Span>
            </>
          ) : (
            "Generate Payslips"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="Generate Monthly Payslips"
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%", minWidth: 400 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Generate payslips for all employees for the selected period.
        </Typography>

        <TextField
          fullWidth
          label="Payroll Period"
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
            What this will do:
          </Typography>
          <List dense>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="• Generate payslips for all active employees"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="• Use employee base salary as gross earnings"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="• Apply default deductions (if configured)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="• Skip employees who already have payslips for this period"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Box>

        <Typography variant="body2" color="warning.main">
          Note: This is a background process. Generated payslips will appear in the payslips list shortly.
        </Typography>
      </Box>
    </ModalDialog>
  );
};

export default GeneratePayslipsModal;