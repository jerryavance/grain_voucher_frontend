import { Box, Button, Stack, useTheme, useMediaQuery } from "@mui/material";
import { useFormik } from "formik";
import { FC, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { H1, Paragraph, Small } from "../../../components/Typography";
import { RegisterService } from "./Register.service";
import { toast } from "react-hot-toast";
import FormFactory from "../../../components/UI/FormFactory";
import { UserFormValidations } from "../../Users/UserFormValidations";
import { UserFormFields } from "../../Users/UserFormFields";
import { primary } from "../../../theme/themeColors";
import LoadingButton from "@mui/lab/LoadingButton";

const AnimatedBox = styled(Box)({
  transition: 'all 0.3s ease-in-out',
  transform: 'translateY(0)',
  opacity: 1,
  '&.entering': {
    transform: 'translateY(-10px)',
    opacity: 0,
  },
  '&.exiting': {
    transform: 'translateY(10px)',
    opacity: 0,
  },
});

const Register: FC = () => {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const formRef = useRef<HTMLFormElement | null>(null);
  const navigate = useNavigate();

  const getFormFields = useCallback(() => {
    return UserFormFields(otpSent);
  }, [otpSent]);

  const formik = useFormik({
    initialValues: {
      phone_number: "+256",
      first_name: "",
      last_name: "",
      otp_code: "",
      accept_terms: true,
      role: "",
    },
    validationSchema: UserFormValidations(otpSent),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,

    onSubmit: async (values) => {
      console.log('Form submitted with values:', values);
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      try {
        if (!otpSent) {
          // Request OTP first
          console.log('Requesting OTP for phone:', values.phone_number);
          const response = await RegisterService.requestOtp(values.phone_number, "registration");
          
          // Handle successful OTP request
          if (response?.message) {
            setSuccessMessage(response.message);
            toast.success(response.message);
          }
          
          setOtpSent(true);
          
        } else {
          // Register account with all required fields
          console.log('Registering account with OTP:', values.otp_code);
          const response = await RegisterService.Register({
            phone_number: values.phone_number,
            first_name: values.first_name,
            last_name: values.last_name,
            otp_code: values.otp_code,
            role: values.role,
            accept_terms: values.accept_terms,
          });

          // Registration successful - navigate immediately
          console.log('Registration response:', response);
          
          const successMessage = response?.message || "Account created successfully!";
          toast.success(successMessage);
          
          // Clear form and states
          formik.resetForm();
          setOtpSent(false);
          setSuccessMessage("");
          setError("");
          
          // Navigate to login page with a small delay to ensure state is cleared
          console.log('Navigating to login page...');
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "Your account has been successfully created. Please login to continue...",
                registrationSuccess: true,
              },
              replace: true, // This replaces the current entry in history
            });
          }, 100);
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.response?.data?.non_field_errors) {
          const errorMessage = error.response.data.non_field_errors[0];
          setError(errorMessage);
          toast.error(errorMessage);
          
          // If user already exists, suggest login
          if (errorMessage.includes("already exists")) {
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
        } else if (error.response?.data) {
          // Handle field-specific errors
          const fieldErrors = error.response.data;
          formik.setErrors(fieldErrors);
          
          const firstError = Object.values(fieldErrors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          setError(errorMessage as string);
          toast.error(errorMessage as string);
        } else {
          const errorMessage = error.message || "An error occurred while creating the account.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form and go back to phone number step
  const handleBackToPhone = () => {
    setOtpSent(false);
    setError("");
    setSuccessMessage("");
    formik.setFieldValue("otp_code", "");
  };

  return (
    <Box
      data-aos="fade-up"
      data-aos-duration="800"
      sx={{
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box 
        sx={{ 
          width: "100%", 
          maxWidth: { xs: "100%", sm: "600px", md: "700px" },
          mx: "auto",
          px: isMobile ? 3 : 4 
        }}
      >
        <Stack spacing={1} sx={{ textAlign: { xs: "center", sm: "left" }, mb: 3 }}>
          <H1 
            fontSize={{ xs: 24, sm: 28 }} 
            fontWeight={800} 
            mb={{ xs: 2, sm: 3 }}
            sx={{ lineHeight: 1.2 }}
          >
            Sign Up <span style={{ color: primary.main }}>Now</span>
          </H1>
          <H1 
            fontSize={{ xs: 14, sm: 16 }} 
            fontWeight={700}
            sx={{ marginBottom: { xs: 1, sm: 0 } }}
          >
            Register to create your Grain Voucher account.
          </H1>
          <Paragraph 
            pb={{ xs: 2, sm: 3 }} 
            fontSize={{ xs: 11, sm: 12 }}
            sx={{ opacity: 0.8 }}
          >
            Unlock the full value of your harvest.
          </Paragraph>
        </Stack>

        <form
          ref={formRef}
          onSubmit={(e) => {
            console.log('Form submit event triggered');
            formik.handleSubmit(e);
          }}
          encType="multipart/form-data"
        >
          {successMessage && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#e8f5e8', 
                borderRadius: 2,
                border: '1px solid #4caf50',
                mb: 2,
              }}
            >
              <Small color="success.main">{successMessage}</Small>
            </Box>
          )}
          
          <AnimatedBox sx={{ width: "100%" }}>
            <FormFactory
              others={{ sx: { marginBottom: "0rem" } }}
              formikInstance={formik}
              formFields={getFormFields()}
              validationSchema={UserFormValidations(otpSent)}
            />
          </AnimatedBox>

          {error && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#fee', 
                borderRadius: 2,
                border: '1px solid #fcc',
              }}
            >
              <Small color="error.main">{error}</Small>
            </Box>
          )}

          {otpSent && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="text"
                size="small"
                onClick={handleBackToPhone}
                disabled={loading}
                sx={{ 
                  color: primary.main,
                  textTransform: 'none',
                  fontSize: 12,
                }}
              >
                ← Back to account details
              </Button>
            </Box>
          )}

          <Box sx={{ mt: { xs: 3, sm: 4 } }}>
            <LoadingButton
              loading={loading}
              type="submit"
              variant="contained"
              fullWidth
              size={isMobile ? "large" : "medium"}
              onClick={() => {
                console.log('Button clicked, form valid:', formik.isValid);
                console.log('Current errors:', formik.errors);
              }}
              sx={{ 
                bgcolor: primary.main,
                py: { xs: 1.5, sm: 1.2 },
                borderRadius: 2,
                textTransform: 'none',
                fontSize: { xs: 16, sm: 14 },
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(36, 38, 73, 0.3)',
                '&:hover': {
                  bgcolor: primary.main,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(36, 38, 73, 0.4)',
                },
                transition: 'all 0.3s ease',
                '&:disabled': {
                  bgcolor: 'grey.400',
                  transform: 'none',
                  boxShadow: 'none',
                }
              }}
            >
              {otpSent ? 'Create Account' : 'Request OTP'}
            </LoadingButton>
          </Box>
        </form>
        
        <Small
          margin="auto"
          mt={{ xs: 4, sm: 3 }}
          sx={{ 
            display: "block",
            textAlign: "center",
            fontSize: { xs: 12, sm: 13 },
          }}
          color="text.disabled"
        >
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Small 
              color="primary.main"
              sx={{ 
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Login Now
            </Small>
          </Link>
        </Small>
      </Box>
    </Box>
  );
};

export default Register;