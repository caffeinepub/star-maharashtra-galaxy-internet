import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, X, CheckCircle2, Receipt, UserCircle } from 'lucide-react';
import type { StepProps, DocumentsData } from '../types';

export function StepVerificationDocuments({ onValidationChange, customerDetails }: StepProps) {
  const [aadhaarCard, setAadhaarCard] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [applicantPhoto, setApplicantPhoto] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const requiresPaymentReceipt = customerDetails?.paymentOption === 'UPI';

  // Store the latest callback in a ref to avoid effect dependency issues
  const onValidationChangeRef = useRef(onValidationChange);
  
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // Track previous validation state to avoid redundant calls
  const prevValidationRef = useRef<{ isValid: boolean; data?: DocumentsData }>({
    isValid: false,
    data: undefined,
  });

  useEffect(() => {
    const isValid =
      aadhaarCard !== null &&
      panCard !== null &&
      (!requiresPaymentReceipt || paymentReceipt !== null);

    const data: DocumentsData | undefined = isValid
      ? {
          aadhaarCard: aadhaarCard!,
          panCard: panCard!,
          ...(requiresPaymentReceipt && paymentReceipt ? { paymentReceipt } : {}),
          ...(applicantPhoto ? { applicantPhoto } : {}),
        }
      : undefined;

    // Only call onValidationChange if the validation state actually changed
    const prev = prevValidationRef.current;
    const validityChanged = prev.isValid !== isValid;
    const dataChanged = isValid && (
      prev.data?.aadhaarCard !== aadhaarCard ||
      prev.data?.panCard !== panCard ||
      prev.data?.paymentReceipt !== paymentReceipt ||
      prev.data?.applicantPhoto !== applicantPhoto
    );
    
    if (validityChanged || dataChanged) {
      prevValidationRef.current = { isValid, data };
      onValidationChangeRef.current(isValid, data);
    }
  }, [aadhaarCard, panCard, paymentReceipt, applicantPhoto, requiresPaymentReceipt]);

  const handleFileChange = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Please upload clear photos or scans of your Aadhaar Card and PAN Card.
          {requiresPaymentReceipt && ' Also upload your UPI payment receipt (PhonePe/Google Pay).'}
          {' You may also upload a passport-size photo.'}
        </AlertDescription>
      </Alert>

      {/* Aadhaar Card Upload */}
      <div className="space-y-3">
        <Label htmlFor="aadhaar" className="text-base font-semibold">
          Aadhaar Card <span className="text-destructive">*</span>
        </Label>
        {!aadhaarCard ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <Label
              htmlFor="aadhaar"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              Click to upload Aadhaar Card
            </Label>
            <Input
              id="aadhaar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0] || null,
                  setAadhaarCard,
                  setAadhaarPreview
                )
              }
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">{aadhaarCard.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(setAadhaarCard, setAadhaarPreview)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {aadhaarPreview && (
              <img
                src={aadhaarPreview}
                alt="Aadhaar preview"
                className="w-full max-h-48 object-contain rounded"
              />
            )}
            <Label htmlFor="aadhaar-replace" className="cursor-pointer">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>Replace File</span>
              </Button>
            </Label>
            <Input
              id="aadhaar-replace"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0] || null,
                  setAadhaarCard,
                  setAadhaarPreview
                )
              }
            />
          </div>
        )}
      </div>

      {/* PAN Card Upload */}
      <div className="space-y-3">
        <Label htmlFor="pan" className="text-base font-semibold">
          PAN Card <span className="text-destructive">*</span>
        </Label>
        {!panCard ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <Label
              htmlFor="pan"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              Click to upload PAN Card
            </Label>
            <Input
              id="pan"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null, setPanCard, setPanPreview)
              }
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">{panCard.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(setPanCard, setPanPreview)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {panPreview && (
              <img
                src={panPreview}
                alt="PAN preview"
                className="w-full max-h-48 object-contain rounded"
              />
            )}
            <Label htmlFor="pan-replace" className="cursor-pointer">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>Replace File</span>
              </Button>
            </Label>
            <Input
              id="pan-replace"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null, setPanCard, setPanPreview)
              }
            />
          </div>
        )}
      </div>

      {/* Payment Receipt Upload (conditional) */}
      {requiresPaymentReceipt && (
        <div className="space-y-3">
          <Label htmlFor="receipt" className="text-base font-semibold">
            Payment Receipt (PhonePe/Google Pay) <span className="text-destructive">*</span>
          </Label>
          {!paymentReceipt ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors bg-blue-50/50 dark:bg-blue-950/20">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <Label
                htmlFor="receipt"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                Click to upload Payment Receipt
              </Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(
                    e.target.files?.[0] || null,
                    setPaymentReceipt,
                    setReceiptPreview
                  )
                }
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-3 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{paymentReceipt.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(setPaymentReceipt, setReceiptPreview)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {receiptPreview && (
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full max-h-48 object-contain rounded"
                />
              )}
              <Label htmlFor="receipt-replace" className="cursor-pointer">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>Replace File</span>
                </Button>
              </Label>
              <Input
                id="receipt-replace"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(
                    e.target.files?.[0] || null,
                    setPaymentReceipt,
                    setReceiptPreview
                  )
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Applicant Photo Upload (optional) */}
      <div className="space-y-3">
        <Label htmlFor="applicant-photo" className="text-base font-semibold">
          Applicant Photo
        </Label>
        {!applicantPhoto ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors bg-purple-50/50 dark:bg-purple-950/20">
            <UserCircle className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <Label
              htmlFor="applicant-photo"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              Click to upload Applicant Photo (passport-size)
            </Label>
            <Input
              id="applicant-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0] || null,
                  setApplicantPhoto,
                  setPhotoPreview
                )
              }
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 space-y-3 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">{applicantPhoto.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(setApplicantPhoto, setPhotoPreview)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Applicant photo preview"
                className="w-full max-h-48 object-contain rounded"
              />
            )}
            <Label htmlFor="applicant-photo-replace" className="cursor-pointer">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>Replace File</span>
              </Button>
            </Label>
            <Input
              id="applicant-photo-replace"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0] || null,
                  setApplicantPhoto,
                  setPhotoPreview
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
