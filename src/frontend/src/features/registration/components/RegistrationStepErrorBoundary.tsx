import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorStack: string | null;
  copied: boolean;
}

export class RegistrationStepErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorStack: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorStack: error.stack || null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Registration step error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorStack: null, copied: false });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleCopyError = async () => {
    const errorDetails = [
      'Registration Step Error',
      '---',
      `Message: ${this.state.error?.message || 'Unknown error'}`,
      '',
      'Stack Trace:',
      this.state.errorStack || 'No stack trace available',
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
        <Card className="shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Registration Page Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              An unexpected error occurred while loading the registration page. Please try refreshing or contact support if the problem persists.
            </p>
            
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium mb-1">Error Message:</p>
              <p className="text-muted-foreground">{this.state.error?.message || 'Unknown error'}</p>
            </div>

            {this.state.errorStack && (
              <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <summary className="cursor-pointer font-medium">Technical Details (Stack Trace)</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">{this.state.errorStack}</pre>
              </details>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button onClick={this.handleRetry} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button onClick={this.handleRefresh} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Page
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
