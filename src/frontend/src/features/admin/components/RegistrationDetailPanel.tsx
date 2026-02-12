import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  AlertCircle, 
  User, 
  Phone, 
  CreditCard, 
  Wifi,
  FileText,
  CheckCircle2,
  Receipt,
  Edit,
  RefreshCw
} from 'lucide-react';
import type { Registration } from '../../../backend';

interface RegistrationDetailPanelProps {
  selectedRegistrationId: string | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  registration: Registration | undefined;
  hasReceipt: boolean;
  isAdmin: boolean;
  isEditMode: boolean;
  onEditClick: () => void;
  onRefetch: () => void;
  formatTimestamp: (timestamp: bigint) => string;
}

export function RegistrationDetailPanel({
  selectedRegistrationId,
  isLoading,
  isFetching,
  isError,
  error,
  registration,
  hasReceipt,
  isAdmin,
  isEditMode,
  onEditClick,
  onRefetch,
  formatTimestamp,
}: RegistrationDetailPanelProps) {
  // No selection state
  if (!selectedRegistrationId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-24">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No Registration Selected
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Select a registration from the list to view details
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading registration details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Registration</AlertTitle>
            <AlertDescription className="mt-2">
              {error instanceof Error ? error.message : 'Failed to load registration details'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button onClick={onRefetch} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state (shouldn't happen but handle it)
  if (!registration) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration Not Found</AlertTitle>
            <AlertDescription>
              The selected registration could not be found.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Success state - show registration details
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>
              ID: {selectedRegistrationId}
            </CardDescription>
          </div>
          {isAdmin && !isEditMode && (
            <Button
              onClick={onEditClick}
              size="sm"
              variant="outline"
              className="gap-2"
              disabled={isFetching}
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px] pr-4">
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{registration.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{registration.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{registration.category}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{registration.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Receipt</p>
                  <div className="flex items-center gap-2">
                    {hasReceipt ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Receipt uploaded</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No receipt</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Router Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Router Information
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Router</p>
                  <p className="font-medium">{registration.router}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    {registration.documents.length} document(s) uploaded
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Terms Acceptance */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Terms & Conditions
              </h3>
              <div className="space-y-2 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted At</p>
                  <p className="font-medium text-sm">
                    {formatTimestamp(registration.termsAcceptedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
