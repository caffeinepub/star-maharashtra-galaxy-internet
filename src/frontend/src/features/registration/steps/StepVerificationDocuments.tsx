import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import type { StepProps, DocumentsData } from '../types';

export function StepVerificationDocuments({ onValidationChange }: StepProps) {
  const [aadhaarCard, setAadhaarCard] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);

  useEffect(() => {
    const isValid = aadhaarCard !== null && panCard !== null;
    const data: DocumentsData | undefined = isValid
      ? { aadhaarCard: aadhaarCard!, panCard: panCard! }
      : undefined;
    onValidationChange(isValid, data);
  }, [aadhaarCard, panCard, onValidationChange]);

  const handleFileChange = (
    type: 'aadhaar' | 'pan',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'aadhaar') {
        setAadhaarCard(file);
      } else {
        setPanCard(file);
      }
    }
  };

  const removeFile = (type: 'aadhaar' | 'pan') => {
    if (type === 'aadhaar') {
      setAadhaarCard(null);
    } else {
      setPanCard(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const FileUploadCard = ({
    title,
    file,
    type,
    inputId,
  }: {
    title: string;
    file: File | null;
    type: 'aadhaar' | 'pan';
    inputId: string;
  }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <Label htmlFor={inputId} className="text-base font-semibold">
          {title} <span className="text-destructive">*</span>
        </Label>
      </div>

      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <Label
            htmlFor={inputId}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            Click to upload or drag and drop
            <br />
            <span className="text-xs">PDF, JPG, PNG (Max 10MB)</span>
          </Label>
          <Input
            id={inputId}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(type, e)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-accent/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Label htmlFor={inputId}>
              <Button variant="outline" size="sm" type="button" asChild>
                <span className="cursor-pointer">Replace</span>
              </Button>
            </Label>
            <Input
              id={inputId}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(type, e)}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(type)}
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Please upload clear copies of your Aadhaar Card and PAN Card. Accepted formats: PDF,
          JPG, PNG (Maximum size: 10MB per file)
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FileUploadCard
          title="Aadhaar Card"
          file={aadhaarCard}
          type="aadhaar"
          inputId="aadhaar-upload"
        />
        <FileUploadCard
          title="PAN Card"
          file={panCard}
          type="pan"
          inputId="pan-upload"
        />
      </div>

      {aadhaarCard && panCard && (
        <Alert className="bg-primary/10 border-primary/20">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <AlertDescription className="text-primary">
            Both documents uploaded successfully. You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
