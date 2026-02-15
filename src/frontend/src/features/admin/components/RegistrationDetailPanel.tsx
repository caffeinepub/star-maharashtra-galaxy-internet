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
  Download,
  Printer,
  UserCircle,
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
import { downloadAllDocuments } from '../utils/adminDownloads';
import { printRegistrationForm } from '../utils/adminPrint';
import { useState } from 'react';
import { toast } from 'sonner';

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
  const [isDownloading, setIsDownloading] = useState(false);

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
            <p className="text-sm text-muted-foreground">Loading registration details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !registration) {
    return (
      <Card className="admin-card shadow-lg border">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Registration</AlertTitle>
            <AlertDescription className="mt-2">
              {error?.message || 'Failed to load registration details. The registration may have been deleted.'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={onRefetch} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const customerName = selectedRegistrationName || buildDisplayName(registration);
  const customerPhone = selectedRegistrationPhone || selectedRegistrationId;

  const handleDownloadAll = async () => {
    if (!registration) return;
    
    setIsDownloading(true);
    try {
      await downloadAllDocuments(registration, customerName);
      toast.success('All documents downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download some documents. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!registration) return;
    printRegistrationForm(registration, customerName, customerPhone);
  };

  return (
    <Card className="admin-card shadow-lg border">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6" />
              {customerName}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {customerPhone}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              size="sm"
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download All
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Form
            </Button>
            {!isEditMode && (
              <Button onClick={onEditClick} variant="default" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
        {dataWarning && (
          <Alert variant="default" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{dataWarning}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <CardContent className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">First Name</p>
                <p className="font-medium">{getValueOrFallback(registration.personalInfo?.firstName)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Middle Name</p>
                <p className="font-medium">{getValueOrFallback(registration.personalInfo?.middleName, 'N/A')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Surname</p>
                <p className="font-medium">{getValueOrFallback(registration.personalInfo?.surname)}</p>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{getValueOrFallback(registration.personalInfo?.dateOfBirth)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{getValueOrFallback(registration.personalInfo?.emailId)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{customerPhone}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{getValueOrFallback(registration.personalInfo?.address)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Service Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {registration.category}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{registration.paymentMethod}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Router</p>
                <p className="font-medium">{registration.router}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Terms & Conditions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Accepted on:</span>
                <span className="text-muted-foreground">
                  {formatTimestamp(registration.termsAcceptedAt)}
                </span>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium hover:text-primary">
                  View Full Terms
                </summary>
                <div className="mt-3 p-4 bg-muted rounded-lg space-y-4 max-h-64 overflow-y-auto">
                  {TERMS_AND_CONDITIONS.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-2">{section.title}</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <Separator />

          {/* Verification Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Verification Documents
            </h3>
            <div className="space-y-6">
              {/* Aadhaar Card */}
              <div>
                <h4 className="font-medium mb-2">Aadhaar Card</h4>
                <DocumentImagePreview
                  document={getDocumentByIndex(registration, 0)}
                  label="Aadhaar Card"
                  onRefetch={onRefetch}
                />
              </div>

              {/* PAN Card */}
              <div>
                <h4 className="font-medium mb-2">PAN Card</h4>
                <DocumentImagePreview
                  document={getDocumentByIndex(registration, 1)}
                  label="PAN Card"
                  onRefetch={onRefetch}
                />
              </div>

              {/* Payment Receipt (conditional) */}
              {registration.paymentMethod === 'UPI' && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Payment Receipt
                  </h4>
                  {hasReceipt ? (
                    <DocumentImagePreview
                      document={registration.receipt}
                      label="Payment Receipt"
                      onRefetch={onRefetch}
                    />
                  ) : (
                    <DocumentImagePreviewPlaceholder message="Payment receipt not available" />
                  )}
                </div>
              )}

              {/* Applicant Photo */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Applicant Photo
                </h4>
                {registration.applicantPhoto ? (
                  <DocumentImagePreview
                    document={registration.applicantPhoto}
                    label="Applicant Photo"
                    onRefetch={onRefetch}
                  />
                ) : (
                  <DocumentImagePreviewPlaceholder message="Applicant photo not provided" />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Delete Section */}
          {isAdmin && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              {deleteError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Registration
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the registration for <strong>{customerName}</strong> (Phone: {customerPhone}).
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
