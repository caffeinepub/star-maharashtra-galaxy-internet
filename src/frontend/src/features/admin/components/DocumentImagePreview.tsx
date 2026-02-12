import { useState } from 'react';
import { ExternalBlob } from '../../../backend';
import { Loader2, AlertCircle, FileImage, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DocumentImagePreviewProps {
  blob: ExternalBlob | null | undefined;
  label: string;
  documentType: 'Aadhaar' | 'PAN' | 'Receipt';
  className?: string;
}

export function DocumentImagePreview({ blob, label, documentType, className = '' }: DocumentImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // If blob is null or undefined, show placeholder
  if (!blob) {
    return <DocumentImagePreviewPlaceholder label={label} message="Document not provided" />;
  }

  let imageUrl: string;
  try {
    imageUrl = blob.getDirectURL();
    if (!imageUrl) {
      console.error(`[DocumentImagePreview] ${documentType}: getDirectURL() returned empty string`);
      return <DocumentImagePreviewPlaceholder label={label} message="Unable to generate preview URL" />;
    }
  } catch (error) {
    console.error(`[DocumentImagePreview] ${documentType}: Failed to get direct URL`, error);
    return <DocumentImagePreviewPlaceholder label={label} message="Failed to load document" />;
  }

  const handleLoad = () => {
    console.log(`[DocumentImagePreview] ${documentType}: Image loaded successfully`);
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`[DocumentImagePreview] ${documentType}: Image load error`, {
      src: (e.target as HTMLImageElement).src,
      error: e,
    });
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    console.log(`[DocumentImagePreview] ${documentType}: Retrying image load (attempt ${retryCount + 1})`);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Card className="overflow-hidden bg-muted/30">
        <div className="relative aspect-[4/3] w-full">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 p-4 text-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Failed to load image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The {documentType} document may be corrupted or unavailable
                </p>
              </div>
              <Button
                onClick={handleRetry}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            </div>
          ) : (
            <img
              key={`${imageUrl}-${retryCount}`}
              src={imageUrl}
              alt={label}
              className="w-full h-full object-contain"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export function DocumentImagePreviewPlaceholder({ label, message }: { label: string; message: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Card className="overflow-hidden bg-muted/30">
        <div className="relative aspect-[4/3] w-full flex flex-col items-center justify-center p-4 text-center">
          <FileImage className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </Card>
    </div>
  );
}
