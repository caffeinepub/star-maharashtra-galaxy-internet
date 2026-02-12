import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  RefreshCw,
  Inbox,
  Trash2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import type { Registration } from '../../../backend';
import { DocumentImagePreview, DocumentImagePreviewPlaceholder } from './DocumentImagePreview';

interface RegistrationDetailPanelProps {
  selectedRegistrationId: string | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  registration: Registration | null | undefined;
  hasReceipt: boolean;
  isAdmin: boolean;
  isEditMode: boolean;
  onEditClick: () => void;
  onRefetch: () => void;
  formatTimestamp: (timestamp: bigint) => string;
  totalRegistrations: number;
  onDelete: () => void;
  isDeleting: boolean;
  deleteError: string | null;
  dataWarning?: string;
  selectedRegistrationName?: string;
  selectedRegistrationPhone?: string;
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
  totalRegistrations,
  onDelete,
  isDeleting,
  deleteError,
  dataWarning,
  selectedRegistrationName,
  selectedRegistrationPhone,
}: RegistrationDetailPanelProps) {
  // Empty state when no registrations exist
  if (totalRegistrations === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-24">
          <div className="text-center">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No Customer Submissions
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              There are no customer registrations to edit yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  // Error state - but still show Delete option
  if (isError) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Error Loading Details</CardTitle>
              <CardDescription>
                ID: {selectedRegistrationId}
              </CardDescription>
            </div>
            {isAdmin && !isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this customer registration? This action cannot be undone.
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">ID: {selectedRegistrationId}</p>
                        {selectedRegistrationName && (
                          <p className="text-sm text-muted-foreground">Name: {selectedRegistrationName}</p>
                        )}
                        {selectedRegistrationPhone && (
                          <p className="text-sm text-muted-foreground">Phone: {selectedRegistrationPhone}</p>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Registration'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Delete Failed</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Registration</AlertTitle>
            <AlertDescription className="mt-2">
              {error instanceof Error ? error.message : 'Failed to load registration details'}
              <div className="mt-3 text-sm">
                The registration data may be corrupted or in a legacy format. You can still delete this entry using the Delete button above.
              </div>
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

  // No data state - but still show Delete option
  if (!registration) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Registration Not Found</CardTitle>
              <CardDescription>
                ID: {selectedRegistrationId}
              </CardDescription>
            </div>
            {isAdmin && !isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this customer registration? This action cannot be undone.
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">ID: {selectedRegistrationId}</p>
                        {selectedRegistrationName && (
                          <p className="text-sm text-muted-foreground">Name: {selectedRegistrationName}</p>
                        )}
                        {selectedRegistrationPhone && (
                          <p className="text-sm text-muted-foreground">Phone: {selectedRegistrationPhone}</p>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Registration'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Delete Failed</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration Not Found</AlertTitle>
            <AlertDescription>
              The selected registration could not be found. It may have been deleted or the data is corrupted.
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

  // Helper function to safely render field values
  const safeValue = (value: any, fallback: string = 'Not available') => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return value;
  };

  // Safely extract documents with defensive checks
  const documents = registration.documents || [];
  const aadhaarDoc = documents.length > 0 ? documents[0] : null;
  const panDoc = documents.length > 1 ? documents[1] : null;
  const receiptDoc = registration.receipt || null;

  // Log document availability for debugging
  console.log('[RegistrationDetailPanel] Document availability:', {
    registrationId: selectedRegistrationId,
    totalDocuments: documents.length,
    hasAadhaar: !!aadhaarDoc,
    hasPAN: !!panDoc,
    hasReceipt: !!receiptDoc,
  });

  // Success state - show registration details with defensive rendering
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
            <div className="flex gap-2">
              <Button
                onClick={onEditClick}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isFetching || isDeleting}
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    disabled={isFetching || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this customer registration? This action cannot be undone.
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Customer: {safeValue(registration.name, 'Unknown')}</p>
                        <p className="text-sm text-muted-foreground">Phone: {safeValue(registration.phone, 'Unknown')}</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Registration'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        {deleteError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Delete Failed</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}
        {dataWarning && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Data Warning</AlertTitle>
            <AlertDescription>{dataWarning}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <CardContent className="space-y-6 pb-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{safeValue(registration.name)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{safeValue(registration.phone)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {safeValue(registration.category)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Payment Information</h3>
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{safeValue(registration.paymentMethod)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Router Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Router Information</h3>
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Router</p>
                <p className="font-medium">{safeValue(registration.router)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Documents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Verification Documents</h3>
            </div>
            <div className="grid gap-4 pl-7">
              {/* Aadhaar Card */}
              <DocumentImagePreview
                blob={aadhaarDoc}
                label="Aadhaar Card"
                documentType="Aadhaar"
              />

              {/* PAN Card */}
              <DocumentImagePreview
                blob={panDoc}
                label="PAN Card"
                documentType="PAN"
              />
            </div>
          </div>

          <Separator />

          {/* Payment Receipt (if applicable) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
            </div>
            <div className="pl-7">
              {receiptDoc ? (
                <DocumentImagePreview
                  blob={receiptDoc}
                  label="Payment Receipt (PhonePe/Google Pay)"
                  documentType="Receipt"
                />
              ) : (
                <DocumentImagePreviewPlaceholder
                  label="Payment Receipt"
                  message="No receipt provided"
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Terms Acceptance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Accepted At</p>
                <p className="font-medium">
                  {registration.termsAcceptedAt
                    ? formatTimestamp(registration.termsAcceptedAt)
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
