import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorStack: string | null;
  errorInfo: React.ErrorInfo | null;
  copied: boolean;
}

export class AdminDetailErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorStack: null,
      errorInfo: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorStack: error.stack || null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AdminDetailErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change (e.g., different registration selected)
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorStack: null,
        errorInfo: null,
        copied: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorStack: null,
      errorInfo: null,
      copied: false
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleCopyError = async () => {
    const errorDetails = [
      'Admin Detail Panel Error',
      '---',
      `Message: ${this.state.error?.message || 'Unknown error'}`,
      '',
      'Stack Trace:',
      this.state.errorStack || 'No stack trace available',
      '',
      'Component Stack:',
      this.state.errorInfo?.componentStack || 'No component stack available',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
      // Fallback: create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = errorDetails;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textarea);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="admin-card shadow-lg border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Rendering Details
            </CardTitle>
            <CardDescription>
              An unexpected error occurred while displaying the registration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>

            {this.state.errorStack && (
              <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <summary className="cursor-pointer font-medium">Technical Details (Stack Trace)</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">{this.state.errorStack}</pre>
              </details>
            )}

            {this.state.errorInfo?.componentStack && (
              <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <summary className="cursor-pointer font-medium">Component Stack</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Troubleshooting Steps:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Click Retry to reload the registration details</li>
                <li>Try selecting a different registration from the list</li>
                <li>If the error persists, the data may be corrupted</li>
                <li>Copy error details and contact support if needed</li>
                <li>Consider deleting this entry if it cannot be recovered</li>
              </ul>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button 
                onClick={this.handleCopyError} 
                variant="secondary" 
                className="gap-2"
                disabled={this.state.copied}
              >
                {this.state.copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Error Details
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
