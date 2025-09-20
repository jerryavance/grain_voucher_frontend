import { Box, Button, Stack, useTheme, useMediaQuery } from "@mui/material";
import { useFormik } from "formik";
import { FC, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import FlexBox from "../../../components/FlexBox";
import { H1, Paragraph, Small } from "../../../components/Typography";
import useAuth from "../../../hooks/useAuth";
import { primary } from "../../../theme/themeColors";
import { PhoneLoginFormValidation } from "./LoginFormValidation";
import { PhoneLoginFormFields } from "./LoginFormFields";
import LoadingButton from "@mui/lab/LoadingButton";
import Success from "../../../components/UI/FormComponents/Success";
import FormFactory from "../../../components/UI/FormFactory";
import { toast } from "react-hot-toast";

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

const Login: FC = () => {
  const { requestOtp, loginWithOtp } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { message } = location.state || {};

  const phoneFormFields = PhoneLoginFormFields(otpSent);

  const formik = useFormik({
    initialValues: {
      phone_number: "+256",
      otp_code: "",
    },
    validationSchema: PhoneLoginFormValidation(otpSent),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      try {
        if (!otpSent) {
          // Request OTP
          if (!requestOtp) throw new Error("OTP request function is not available.");
          
          const response = await requestOtp(values.phone_number, "login");
          
          // Handle successful OTP request
          // Fix: Add type guard for response and fallback message
          const message =
            typeof response === "object" && response !== null && "message" in response
              ? (response as { message: string }).message
              : "OTP sent successfully.";
          setSuccessMessage(message);
          toast.success(message);
          setOtpSent(true);
          setLoading(false);
          
        } else {
          // Login with OTP
          if (!loginWithOtp) throw new Error("Login function is not available.");
          
          await loginWithOtp(values.phone_number, values.otp_code);
          setLoading(false);
          
          // Show success message and navigate
          toast.success("Login successful! Welcome back.");
          navigate("/dashboard");
        }
      } catch (error: any) {
        setLoading(false);
        
        // Handle specific error cases
        if (error.response?.data?.non_field_errors) {
          const errorMessage = error.response.data.non_field_errors[0];
          setError(errorMessage);
          toast.error(errorMessage);
          
          // If user doesn't exist, suggest registration
          if (errorMessage.includes("No account found")) {
            setTimeout(() => {
              navigate("/register");
            }, 2000);
          }
        } else {
          const errorMessage = error.message || "An error occurred during login.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
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
    <FlexBox
      data-aos="fade-up"
      data-aos-duration="800"
      sx={{
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        height: { sm: "100%" },
        padding: { xs: "1.5rem", sm: "2rem" },
        minHeight: "100vh",
      }}
    >
      <Box 
        sx={{ 
          padding: 0,
          width: "100%",
          maxWidth: { xs: "100%", sm: "400px", md: "450px" },
        }}
      >
        <Stack spacing={1} sx={{ textAlign: { xs: "center", sm: "left" } }}>
          <H1 
            fontSize={{ xs: 24, sm: 28 }} 
            fontWeight={800} 
            mb={{ xs: 2, sm: 3 }}
            sx={{ lineHeight: 1.2 }}
          >
            Welcome <span style={{ color: primary.main }}>Back</span>
          </H1>
          <H1 
            fontSize={{ xs: 14, sm: 16 }} 
            fontWeight={700}
            sx={{ marginBottom: { xs: 1, sm: 0 } }}
          >
            Sign in to your Grain Voucher account.
          </H1>
          <Paragraph 
            pb={{ xs: 2, sm: 3 }} 
            fontSize={{ xs: 11, sm: 12 }}
            sx={{ opacity: 0.8 }}
          >
            Your grain, your gains, one click away.
          </Paragraph>
        </Stack>

        <FlexBox justifyContent="space-between" flexWrap="wrap">
          <form ref={formRef} onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            {message && <Success message={message} />}
            
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
                others={{ 
                  sx: { marginBottom: "0rem" }, 
                  columns: 1 
                }}
                formikInstance={formik}
                formFields={phoneFormFields}
                validationSchema={PhoneLoginFormValidation(otpSent)}
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
                  sx={{ 
                    color: primary.main,
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  ← Back to phone number
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
                {otpSent ? 'Sign In with OTP' : 'Request OTP'}
              </LoadingButton>
            </Box>
          </form>
        </FlexBox>
        
        <Small
          margin="auto"
          mt={{ xs: 4, sm: 3 }}
          color="text.disabled"
          sx={{ 
            display: "block",
            textAlign: "center",
            fontSize: { xs: 12, sm: 13 },
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Small 
              color="primary.main"
              sx={{ 
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Register Now
            </Small>
          </Link>
        </Small>
      </Box>
    </FlexBox>
  );
};

export default Login;