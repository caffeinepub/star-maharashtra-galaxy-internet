import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw, FileX } from 'lucide-react';
import type { ExternalBlob } from '../../../backend';

interface DocumentImagePreviewProps {
  document: ExternalBlob | null | undefined;
  label: string;
  onRefetch?: () => void;
}

export function DocumentImagePreview({ document, label, onRefetch }: DocumentImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setIsLoading(false);
      setError(`${label} not available`);
      return;
    }

    try {
      // Use direct URL for streaming and caching
      const url = document.getDirectURL();
      setImageUrl(url);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error(`[DocumentImagePreview] Error loading ${label}:`, err);
      setError(`Failed to load ${label}`);
      setIsLoading(false);
    }
  }, [document, label]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    if (onRefetch) {
      onRefetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading {label}...</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error || `${label} could not be loaded`}</span>
          </AlertDescription>
        </Alert>
        {onRefetch && (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border bg-muted">
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-auto object-contain max-h-96"
          onError={() => {
            setError(`Failed to display ${label}`);
            setImageUrl(null);
          }}
        />
      </div>
    </div>
  );
}

export function DocumentImagePreviewPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 bg-muted rounded-lg border border-dashed">
      <div className="text-center">
        <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
