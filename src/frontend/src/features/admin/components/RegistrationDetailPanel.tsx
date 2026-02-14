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
  Mail,
  Calendar,
  MapPin,
  FileCheck,
} from 'lucide-react';
import type { Registration } from '../../../backend';
import { DocumentImagePreview, DocumentImagePreviewPlaceholder } from './DocumentImagePreview';
import { TERMS_AND_CONDITIONS } from '../../registration/terms';
import { 
  getValueOrFallback, 
  buildDisplayName, 
  formatTimestamp as formatTimestampUtil,
  getDocumentByIndex,
} from '../utils/registrationDetails';

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
            <AlertTitle>Registration Not Found</AlertTitle>
            <AlertDescription>
              The selected registration could not be found. It may have been deleted or the ID is invalid.
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

  // Normal state: Display registration details
  const aadhaarDoc = getDocumentByIndex(registration, 0);
  const panDoc = getDocumentByIndex(registration, 1);
  const receiptDoc = registration.receipt;

  // Build display name from personalInfo
  const displayName = buildDisplayName(registration);

  // Extract personal info with fallbacks
  const firstName = getValueOrFallback(registration.personalInfo?.firstName);
  const middleName = getValueOrFallback(registration.personalInfo?.middleName);
  const surname = getValueOrFallback(registration.personalInfo?.surname);
  const dateOfBirth = getValueOrFallback(registration.personalInfo?.dateOfBirth);
  const emailId = getValueOrFallback(registration.personalInfo?.emailId);
  const address = getValueOrFallback(registration.personalInfo?.address);
  const phone = getValueOrFallback(registration.phone);

  return (
    <Card className="admin-card shadow-lg border">
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
                        <p className="text-sm font-medium">Customer: {displayName}</p>
                        <p className="text-sm text-muted-foreground">Phone: {phone}</p>
                        <p className="text-sm text-muted-foreground">ID: {selectedRegistrationId}</p>
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
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Surname</p>
                <p className="font-medium">{surname}</p>
              </div>
              {middleName !== 'Not provided' && (
                <div>
                  <p className="text-sm text-muted-foreground">Middle Name</p>
                  <p className="font-medium">{middleName}</p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{dateOfBirth}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email ID</p>
                  <p className="font-medium break-all">{emailId}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{address}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Service Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {registration.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge variant="outline" className="mt-1">
                  {registration.paymentMethod}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Router Provision</p>
                <Badge variant="outline" className="mt-1">
                  {registration.router}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Terms and Conditions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Terms and Conditions</h3>
            </div>
            <div className="pl-7 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Accepted At</p>
                  <p className="font-medium">{formatTimestamp(registration.termsAcceptedAt)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Terms Content:</p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                  {TERMS_AND_CONDITIONS.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Verification Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              {/* Aadhaar Card */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Aadhaar Card</p>
                {aadhaarDoc ? (
                  <DocumentImagePreview
                    document={aadhaarDoc}
                    label="Aadhaar Card"
                    onRefetch={onRefetch}
                  />
                ) : (
                  <DocumentImagePreviewPlaceholder message="Aadhaar card not provided" />
                )}
              </div>

              {/* PAN Card */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">PAN Card</p>
                {panDoc ? (
                  <DocumentImagePreview
                    document={panDoc}
                    label="PAN Card"
                    onRefetch={onRefetch}
                  />
                ) : (
                  <DocumentImagePreviewPlaceholder message="PAN card not provided" />
                )}
              </div>

              {/* Payment Receipt (Optional) */}
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Payment Receipt</p>
                {receiptDoc ? (
                  <DocumentImagePreview
                    document={receiptDoc}
                    label="Payment Receipt"
                    onRefetch={onRefetch}
                  />
                ) : (
                  <DocumentImagePreviewPlaceholder message="Receipt not provided" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
