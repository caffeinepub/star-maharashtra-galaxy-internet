import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Wifi, Shield } from 'lucide-react';
import { StepCustomerDetails } from './steps/StepCustomerDetails';
import { StepVerificationDocuments } from './steps/StepVerificationDocuments';
import { StepTermsAndConditions } from './steps/StepTermsAndConditions';
import { StepOTPVerification } from './steps/StepOTPVerification';
import { RegistrationStepErrorBoundary } from './components/RegistrationStepErrorBoundary';
import { useDoubleInteraction } from './hooks/useDoubleInteraction';
import type { CustomerDetailsData, DocumentsData } from './types';

interface RegistrationFlowProps {
  onNavigateToAdmin: () => void;
}

export function RegistrationFlow({ onNavigateToAdmin }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsData | null>(null);
  const [documents, setDocuments] = useState<DocumentsData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<bigint | null>(null);

  const steps = [
    { number: 1, title: 'Customer Details', component: StepCustomerDetails },
    { number: 2, title: 'Verification Documents', component: StepVerificationDocuments },
    { number: 3, title: 'Terms and Conditions', component: StepTermsAndConditions },
    { number: 4, title: 'OTP Verification', component: StepOTPVerification },
  ];

  // Double-interaction hook for Admin Panel access
  const { showHint, handleClick, handleDoubleClick, handleTouchStart } = useDoubleInteraction({
    onDoubleInteraction: onNavigateToAdmin,
    hintDuration: 2000,
    doubleClickThreshold: 300,
  });

  // Ensure step is always in valid range
  useEffect(() => {
    if (currentStep < 1) {
      setCurrentStep(1);
    } else if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [currentStep, steps.length]);

  const canProceedToStep2 = customerDetails !== null;
  const canProceedToStep3 = documents !== null;
  const canProceedToStep4 = termsAccepted && termsAcceptedAt !== null;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return canProceedToStep2;
      case 2:
        return canProceedToStep3;
      case 3:
        return canProceedToStep4;
      case 4:
        return false; // OTP step handles its own submission
      default:
        return false;
    }
  };

  // Create stable, memoized validation callbacks for each step
  const handleStep1ValidationChange = useCallback((isValid: boolean, data?: any) => {
    setCustomerDetails(isValid ? (data as CustomerDetailsData) : null);
  }, []);

  const handleStep2ValidationChange = useCallback((isValid: boolean, data?: any) => {
    setDocuments(isValid ? (data as DocumentsData) : null);
  }, []);

  const handleStep3ValidationChange = useCallback((isValid: boolean, data?: any) => {
    setTermsAccepted(isValid);
    if (isValid && data) {
      setTermsAcceptedAt((data as { timestamp: bigint }).timestamp);
    }
  }, []);

  // Dummy callback for step 4 (OTP doesn't use validation callback)
  const handleStep4ValidationChange = useCallback(() => {
    // No-op
  }, []);

  // Map step number to appropriate validation handler
  const getValidationHandler = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return handleStep1ValidationChange;
      case 2:
        return handleStep2ValidationChange;
      case 3:
        return handleStep3ValidationChange;
      case 4:
        return handleStep4ValidationChange;
      default:
        return handleStep1ValidationChange;
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component || StepCustomerDetails;
  const currentValidationHandler = getValidationHandler(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="no-print border-b splash-galaxy-bg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white text-black">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Galaxy Internet</h1>
                <p className="text-sm text-gray-200">Customer Registration</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                aria-label="Open Admin Panel"
                title="Open Admin Panel"
                className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <Shield className="w-5 h-5" />
              </button>
              {showHint && (
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-white text-gray-900 text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200">
                  Double-click to open Admin Panel
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-white transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Indicator */}
        <div className="no-print mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex-1 text-center ${
                  step.number < steps.length ? 'mr-2' : ''
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold mb-2 transition-colors ${
                    currentStep === step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : currentStep > step.number
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                <p
                  className={`text-xs font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <RegistrationStepErrorBoundary>
          <Card className="shadow-lg">
            <CardHeader className="no-print">
              <CardTitle className="text-2xl">
                Step {currentStep}: {steps[currentStep - 1]?.title || 'Customer Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CurrentStepComponent
                onValidationChange={currentValidationHandler}
                customerDetails={customerDetails}
                documents={documents}
                termsAcceptedAt={termsAcceptedAt}
              />

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="no-print flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </RegistrationStepErrorBoundary>
      </main>
    </div>
  );
}
