import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminDetailErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin detail panel error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change (e.g., different registration selected)
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Error Loading Details</CardTitle>
            <CardDescription>
              An unexpected error occurred while displaying the registration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Rendering Error</AlertTitle>
              <AlertDescription>
                {this.state.error?.message || 'An unexpected error occurred'}
                <div className="mt-3 text-sm">
                  This may be caused by corrupted or legacy data. Try selecting a different registration or use the Retry button below.
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex justify-center gap-3">
              <Button onClick={this.handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
