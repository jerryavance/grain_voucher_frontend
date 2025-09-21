import { FC, useState } from "react";
import { Button, TextField, CircularProgress } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { Send, Close } from "@mui/icons-material";
import { primaryColor } from "../../components/UI/Theme";
import { membershipService, MembershipService } from "../Membership/HubMembership.service";

interface JoinHubFormProps {
  hubId: string;
  hubName: string;
  handleCancel?: () => void;
  handleRefreshHubData?: () => void;
}

const JoinHubForm: FC<JoinHubFormProps> = ({
  handleRefreshHubData,
  hubId,
  hubName,
  handleCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    reason: "",
  };

  const validationSchema = Yup.object().shape({
    reason: Yup.string()
      .min(10, "Please provide at least 10 characters")
      .max(500, "Reason should not exceed 500 characters")
      .required("Please provide a reason for joining"),
  });

  const handleJoinHubSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const membershipRequest = {
        hub: hubId,
        reason: values.reason,
      };
      
      await membershipService.requestMembership(membershipRequest);
      toast.success("Application submitted successfully! You'll be notified once reviewed.");
      
      if (handleRefreshHubData) {
        handleRefreshHubData();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail ||
                          "Failed to submit application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleJoinHubSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        height: '100%',
        padding: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#333',
              marginBottom: '2px'
            }}>
              Apply to Join
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              {hubName}
            </div>
          </div>
          
          {handleCancel && (
            <Button
              onClick={handleCancel}
              size="small"
              sx={{ 
                minWidth: 'auto', 
                padding: '4px',
                color: '#666'
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          )}
        </div>

        <TextField
          fullWidth
          id="reason"
          name="reason"
          label="Why do you want to join?"
          multiline
          rows={3}
          placeholder="Tell us why you'd like to join this hub..."
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.reason && Boolean(formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.75rem'
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem'
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.65rem'
            }
          }}
        />

        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: 'auto' 
        }}>
          <Button 
            variant="contained" 
            size="small"
            fullWidth
            type="submit"
            disabled={isSubmitting}
            startIcon={isSubmitting ? 
              <CircularProgress size={12} color="inherit" /> : 
              <Send />
            }
            sx={{ 
              fontSize: '0.7rem', 
              padding: '6px 12px',
              backgroundColor: primaryColor,
              '&:hover': {
                backgroundColor: primaryColor,
                opacity: 0.9
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
          
          {handleCancel && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{ 
                fontSize: '0.7rem', 
                padding: '6px 12px' 
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default JoinHubForm;