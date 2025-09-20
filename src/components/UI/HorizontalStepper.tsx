import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import { Small, Span } from "../Typography";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useMediaQuery, useTheme } from "@mui/material";

export interface IStep {
  label: string;
  component: React.ReactNode;
  formControl?: any;
  formErrorState?: boolean;
}

export interface IHorizontalStepperProps {
  steps: IStep[];
  submitBtn?: React.ReactNode;
}

const HorizontalStepper: React.FC<IHorizontalStepperProps> = ({
  steps = [],
  submitBtn,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === steps.length) {
        return prevActiveStep;
      }
      return prevActiveStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper
        activeStep={activeStep}
        sx={{
          marginBottom: "3rem",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {steps.map((step, index) => {
          return (
            <Step
              key={index}
              sx={{ marginBottom: isMobile ? "1rem" : 0, width: "100%" }}
            >
              <StepLabel sx={{ width: "100%", textAlign: "center" }}>
                <Button
                  color={step.formErrorState ? "primary" : "error"}
                  variant={activeStep === index ? "contained" : "outlined"}
                  sx={{ width: "100%", borderRadius: 50 }}
                >
                  {step.label}
                </Button>
                {!step.formErrorState && (
                  <Small
                    sx={{
                      color: !step.formErrorState ? "#FD396D" : "",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ReportProblemOutlinedIcon
                      color="error"
                      sx={{ fontSize: 12, marginRight: 0.5 }}
                    />
                    <Span>{"contains invalid fields"}</Span>
                  </Small>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <>
        {/* Stepper Content */}
        <Box sx={{ mt: 2, mb: 1 }}>{steps[activeStep]?.component}</Box>
        {/* Stepper Content */}

        {steps.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              pt: 2,
            }}
          >
            <Button
              color="primary"
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 1 : 0 }}
              size="small"
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button
              disabled={!steps[activeStep]?.formControl?.isValid}
              size="small"
              sx={{ minWidth: 100 }}
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
            {activeStep === steps.length && submitBtn}
          </Box>
        )}
      </>
    </Box>
  );
};

export default HorizontalStepper;

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Stepper from '@mui/material/Stepper';
// import Step from '@mui/material/Step';
// import StepLabel from '@mui/material/StepLabel';
// import Button from '@mui/material/Button';
// import { Small, Span } from '../Typography';
// import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

// export interface IStep {
//     label: string;
//     component: React.ReactNode;
//     formControl?: any;
//     formErrorState?: boolean;
// }

// export interface IHorizontalStepperProps {
//     steps: IStep[];
//     submitBtn?: React.ReactNode;
// }

// const HorizontalStepper: React.FC<IHorizontalStepperProps> = ({ steps = [], submitBtn }) => {
//     const [activeStep, setActiveStep] = React.useState(0);

//     const handleNext = () => {
//         setActiveStep((prevActiveStep) => {
//             if (prevActiveStep === steps.length) {
//                 return prevActiveStep;
//             }
//             return prevActiveStep + 1;
//         });
//     };

//     const handleBack = () => {
//         setActiveStep((prevActiveStep) => prevActiveStep - 1);
//     };

//     return (
//         <Box sx={{ width: '100%' }}>
//             <Stepper activeStep={activeStep} sx={{ marginBottom: '3rem' }}>
//                 {steps.map((step, index) => {
//                     return (
//                         <Step key={index}>
//                             <StepLabel>
//                                 <Button color={step.formErrorState ? 'primary' : 'error'} variant='outlined'>{step.label}</Button>
//                                 {
//                                     !step.formErrorState &&
//                                     <Small sx={{ color: !step.formErrorState ? '#FD396D' : '', display: 'flex', alignItems: 'center' }}>

//                                         <ReportProblemOutlinedIcon color='error' sx={{ fontSize: 12, marginRight: 0.5 }} />
//                                         <Span>
//                                             {
//                                                 console.log('error', step)

//                                             }
//                                             {'contains invalid fields'}
//                                         </Span>

//                                     </Small>
//                                 }
//                             </StepLabel>
//                         </Step>
//                     );
//                 })}
//             </Stepper>
//             <>
//                 {/* Stepper Content */}
//                 <Box sx={{ mt: 2, mb: 1 }}>
//                     {steps[activeStep]?.component}
//                 </Box>
//                 {/* Stepper Content */}

//                 {steps.length > 0 &&
//                     <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
//                         <Button
//                             color="primary"
//                             variant='outlined'
//                             disabled={activeStep === 0}
//                             onClick={handleBack}
//                             sx={{ mr: 1 }}
//                             size='small'
//                         >
//                             Back
//                         </Button>
//                         <Box sx={{ flex: '1 1 auto' }} />
//                         {
//                             activeStep < steps.length - 1?
//                             <Button disabled={!steps[activeStep]?.formControl?.isValid} size='small' variant='outlined' onClick={handleNext}>
//                                 Next
//                             </Button>
//                             : submitBtn
//                         }
//                     </Box>
//                 }
//             </>
//         </Box>
//     );
// }

// export default HorizontalStepper;
