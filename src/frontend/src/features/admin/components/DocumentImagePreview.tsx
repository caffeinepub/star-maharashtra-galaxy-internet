import { useState } from 'react';
import { ExternalBlob } from '../../../backend';
import { Loader2, AlertCircle, FileImage } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DocumentImagePreviewProps {
  blob: ExternalBlob;
  label: string;
  className?: string;
}

export function DocumentImagePreview({ blob, label, className = '' }: DocumentImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = blob.getDirectURL();

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Card className="overflow-hidden bg-muted/30">
        <div className="relative aspect-[4/3] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 p-4 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load image</p>
              <p className="text-xs text-muted-foreground mt-1">The document may be corrupted</p>
            </div>
          ) : (
            <img
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
