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
      <Card className="admin-card shadow-lg border">
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
      <Card className="admin-card shadow-lg border">
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
      <Card className="admin-card shadow-lg border">
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
      <Card className="admin-card shadow-lg border">
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
      <Card className="admin-card shadow-lg border">
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
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              The registration data could not be loaded. This entry may be corrupted or in a legacy format. You can delete this entry using the Delete button above.
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

  // Extract documents safely
  const aadhaarDoc = registration.documents?.[0] || null;
  const panDoc = registration.documents?.[1] || null;

  // Main detail view
  return (
    <Card className="admin-card shadow-lg border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {registration.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" />
              {registration.phone}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditMode && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEditClick}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
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
                          <p className="text-sm font-medium">Name: {registration.name}</p>
                          <p className="text-sm text-muted-foreground">Phone: {registration.phone}</p>
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
              </>
            )}
            {isFetching && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
        {deleteError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Delete Failed</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}
        {dataWarning && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Data Warning</AlertTitle>
            <AlertDescription>{dataWarning}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-6 pr-4">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{registration.category}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{registration.paymentMethod}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Router</p>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{registration.router}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Terms Accepted</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {formatTimestamp(registration.termsAcceptedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Verification Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {aadhaarDoc ? (
                    <DocumentImagePreview blob={aadhaarDoc} label="Aadhaar Card" documentType="Aadhaar" />
                  ) : (
                    <DocumentImagePreviewPlaceholder label="Aadhaar Card" message="Aadhaar document not available" />
                  )}
                </div>
                <div>
                  {panDoc ? (
                    <DocumentImagePreview blob={panDoc} label="PAN Card" documentType="PAN" />
                  ) : (
                    <DocumentImagePreviewPlaceholder label="PAN Card" message="PAN document not available" />
                  )}
                </div>
              </div>
            </div>

            {/* Payment Receipt (if applicable) */}
            {registration.paymentMethod === 'UPI (PhonePe/Google Pay)' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Payment Receipt
                  </h3>
                  {hasReceipt && registration.receipt ? (
                    <DocumentImagePreview blob={registration.receipt} label="UPI Payment Receipt" documentType="Receipt" />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No Receipt</AlertTitle>
                      <AlertDescription>
                        Payment receipt not available for this registration.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
