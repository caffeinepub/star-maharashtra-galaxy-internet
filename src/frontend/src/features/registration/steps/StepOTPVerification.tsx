import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import type { StepProps } from '../types';
import { useRegistrationMutations } from '../hooks/useRegistrationMutations';

export function StepOTPVerification({
  onValidationChange,
  customerDetails,
  documents,
  termsAcceptedAt,
}: StepProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);

  const { generateOTPMutation, verifyOTPMutation, submitRegistrationMutation } =
    useRegistrationMutations();

  useEffect(() => {
    if (customerDetails?.phone) {
      setPhoneNumber(customerDetails.phone);
    }
  }, [customerDetails]);

  const handleGenerateOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      return;
    }

    try {
      const generatedCode = await generateOTPMutation.mutateAsync(phoneNumber);
      setGeneratedOTP(generatedCode);
      setOtp('');
    } catch (error) {
      console.error('Failed to generate OTP:', error);
    }
  };

  const handleVerifyOTP = async () => {
    if (!phoneNumber || !otp || otp.length !== 6) {
      return;
    }

    try {
      const isValid = await verifyOTPMutation.mutateAsync({
        phone: phoneNumber,
        otp,
      });

      if (isValid && customerDetails && documents && termsAcceptedAt) {
        // Submit registration
        await submitRegistrationMutation.mutateAsync({
          customerDetails,
          documents,
          termsAcceptedAt,
        });
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  const isGenerating = generateOTPMutation.isPending;
  const isVerifying = verifyOTPMutation.isPending || submitRegistrationMutation.isPending;
  const isSuccess = submitRegistrationMutation.isSuccess;

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Registration Successful!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your registration has been completed successfully. Our team will contact you shortly to
          schedule the installation.
        </p>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Registration ID: <span className="font-mono font-semibold">{phoneNumber}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Mobile Number */}
      <div className="space-y-3">
        <Label htmlFor="otp-phone" className="text-base font-semibold">
          Step 1: Enter your registered mobile number
        </Label>
        <div className="flex gap-2">
          <Input
            id="otp-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            className="flex-1"
          />
          <Button
            onClick={handleGenerateOTP}
            disabled={phoneNumber.length !== 10 || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate OTP
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated OTP Display (Simulated) */}
      {generatedOTP && !verifyOTPMutation.isSuccess && (
        <Alert className="bg-primary/10 border-primary/20">
          <AlertCircle className="w-4 h-4 text-primary" />
          <AlertDescription className="text-primary">
            <strong>Your OTP is: {generatedOTP}</strong>
            <br />
            <span className="text-xs">
              (In production, this would be sent via SMS. Valid for 5 minutes.)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 2: Enter OTP */}
      {generatedOTP && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Step 2: Enter the OTP received</Label>
          <div className="flex flex-col items-center gap-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
              size="lg"
              className="w-full max-w-xs gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Complete Registration
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {generateOTPMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {generateOTPMutation.error instanceof Error
              ? generateOTPMutation.error.message
              : 'Failed to generate OTP. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {verifyOTPMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {verifyOTPMutation.error instanceof Error
              ? verifyOTPMutation.error.message
              : 'Invalid OTP. Please check and try again.'}
          </AlertDescription>
        </Alert>
      )}

      {submitRegistrationMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {submitRegistrationMutation.error instanceof Error
              ? submitRegistrationMutation.error.message
              : 'Failed to complete registration. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
