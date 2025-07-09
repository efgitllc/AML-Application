import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Stepper as MuiStepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
} from '@mui/material';

interface StepItem {
  label: string;
  description?: string;
  content: ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: StepItem[];
  activeStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  orientation?: 'horizontal' | 'vertical';
  alternativeLabel?: boolean;
  showReset?: boolean;
}

export const Stepper = ({
  steps,
  activeStep: controlledActiveStep,
  onStepChange,
  onComplete,
  orientation = 'horizontal',
  alternativeLabel = false,
  showReset = true,
}: StepperProps) => {
  const [activeStep, setActiveStep] = useState(controlledActiveStep || 0);

  const handleNext = () => {
    const nextStep = activeStep + 1;
    if (nextStep === steps.length) {
      onComplete?.();
    } else {
      if (onStepChange) {
        onStepChange(nextStep);
      } else {
        setActiveStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    if (onStepChange) {
      onStepChange(prevStep);
    } else {
      setActiveStep(prevStep);
    }
  };

  const handleReset = () => {
    if (onStepChange) {
      onStepChange(0);
    } else {
      setActiveStep(0);
    }
  };

  const currentStep =
    controlledActiveStep !== undefined ? controlledActiveStep : activeStep;

  return (
    <Box sx={{ width: '100%' }}>
      <MuiStepper
        activeStep={currentStep}
        orientation={orientation}
        alternativeLabel={alternativeLabel}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel optional={step.optional && <Typography variant="caption">Optional</Typography>}>
              {step.label}
            </StepLabel>
            {orientation === 'vertical' && (
              <StepContent>
                {step.description && (
                  <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {step.description}
                  </Typography>
                )}
                {step.content}
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            )}
          </Step>
        ))}
      </MuiStepper>
      {orientation === 'horizontal' && (
        <>
          <Box sx={{ mt: 4 }}>
            {currentStep === steps.length ? (
              <Paper square elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography>All steps completed</Typography>
                {showReset && (
                  <Button onClick={handleReset} sx={{ mt: 1 }}>
                    Reset
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                {steps[currentStep].description && (
                  <Typography color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    {steps[currentStep].description}
                  </Typography>
                )}
                {steps[currentStep].content}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    disabled={currentStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={handleNext} variant="contained">
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}; 