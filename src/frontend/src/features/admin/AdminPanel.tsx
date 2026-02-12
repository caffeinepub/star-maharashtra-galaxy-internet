import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminQueries } from './hooks/useAdminQueries';
import { useAdminSetupCode } from './hooks/useAdminSetupCode';
import { AdminAccessRecoveryCard } from './components/AdminAccessRecoveryCard';
import { EditRegistrationDetailsForm } from './components/EditRegistrationDetailsForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  User, 
  Phone, 
  CreditCard, 
  Wifi,
  FileText,
  CheckCircle2,
  Receipt,
  Edit
} from 'lucide-react';
import type { Registration } from '../../backend';
import { useQueryClient } from '@tanstack/react-query';

interface AdminPanelProps {
  onNavigateToRegistration: () => void;
}

export function AdminPanel({ onNavigateToRegistration }: AdminPanelProps) {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { 
    isAdminQuery, 
    userRoleQuery,
    claimAdminMutation, 
    registrationsQuery,
    useRegistrationWithReceiptQuery,
    updateRegistrationMutation,
  } = useAdminQueries();
  
  const {
    applyAdminSetupCode,
    isApplying,
    isSuccess: codeAppliedSuccess,
    isError: codeAppliedError,
    error: codeError,
    reset: resetCodeMutation,
  } = useAdminSetupCode();

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [showClaimUI, setShowClaimUI] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const selectedRegistrationQuery = useRegistrationWithReceiptQuery(selectedRegistrationId);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isAdmin = isAdminQuery.data === true;
  const isGuest = userRoleQuery.data === 'guest';
  const principalString = identity?.getPrincipal().toString() || '';

  // Check if we should show the claim UI
  // Show claim UI only if authenticated, not admin, and is guest
  useEffect(() => {
    if (isAuthenticated && !isAdminQuery.isLoading && !userRoleQuery.isLoading) {
      setShowClaimUI(isGuest && !isAdmin);
    }
  }, [isAuthenticated, isAdmin, isGuest, isAdminQuery.isLoading, userRoleQuery.isLoading]);

  // When admin setup code is successfully applied, wait for queries to refresh
  useEffect(() => {
    if (codeAppliedSuccess) {
      // Reset the mutation state after a brief moment to allow UI to show success
      const timer = setTimeout(() => {
        resetCodeMutation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeAppliedSuccess, resetCodeMutation]);

  // Reset edit mode when selection changes
  useEffect(() => {
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
  }, [selectedRegistrationId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  // Handle claim admin - this will trigger a re-login to initialize admin
  const handleClaimAdmin = async () => {
    try {
      // Clear current session and re-login to trigger admin initialization
      await clear();
      // Small delay to ensure cleanup
      setTimeout(() => {
        login();
      }, 500);
    } catch (error) {
      console.error('Error claiming admin:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  // Handle save changes
  const handleSaveChanges = async (data: {
    name: string;
    category: string;
    paymentMethod: string;
    router: string;
  }) => {
    if (!selectedRegistrationId) return;

    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await updateRegistrationMutation.mutateAsync({
        id: selectedRegistrationId,
        ...data,
      });
      setUpdateSuccess(true);
      setUpdateError(null);
      // Exit edit mode after successful save
      setTimeout(() => {
        setIsEditMode(false);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update registration';
      setUpdateError(errorMessage);
      setUpdateSuccess(false);
    }
  };

  // Render: Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">Customer Submissions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToRegistration}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
              <CardDescription>
                Please sign in with Internet Identity to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render: Loading admin status
  if (isAdminQuery.isLoading || userRoleQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">Customer Submissions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToRegistration}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Checking access permissions...</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render: Admin not configured (one-time claim)
  if (showClaimUI) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">Customer Submissions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToRegistration}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">Claim Admin Access</CardTitle>
              <CardDescription>
                No admin has been configured yet. Click below to claim admin access for this application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>One-time action</AlertTitle>
                <AlertDescription>
                  This action can only be performed once. The first user to claim admin access will become the sole administrator.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleClaimAdmin}
                  disabled={claimAdminMutation.isPending}
                  size="lg"
                  className="gap-2"
                >
                  {claimAdminMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming access...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Claim Admin Access
                    </>
                  )}
                </Button>
              </div>

              {claimAdminMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {claimAdminMutation.error instanceof Error
                      ? claimAdminMutation.error.message
                      : 'Failed to claim admin access'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render: Access denied (not admin) - with recovery UI
  if (isAuthenticated && !isAdmin && !showClaimUI) {
    const errorMessage = codeAppliedError && codeError instanceof Error 
      ? codeError.message 
      : codeAppliedError 
      ? 'Failed to apply Admin Setup Code' 
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">Customer Submissions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToRegistration}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <AdminAccessRecoveryCard
            onApplyCode={applyAdminSetupCode}
            onSignOut={handleSignOut}
            isApplying={isApplying}
            error={errorMessage}
            success={codeAppliedSuccess}
          />
        </main>
      </div>
    );
  }

  // Render: Admin panel (authorized)
  const registrations = registrationsQuery.data || [];
  const selectedData = selectedRegistrationQuery.data;
  const selectedRegistration = selectedData?.[0];
  const hasReceipt = selectedData?.[1] || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Customer Submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToRegistration}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Registrations List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Customer Registrations</span>
                <Badge variant="secondary">{registrations.length}</Badge>
              </CardTitle>
              <CardDescription>
                Click on a registration to view details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {registrationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No registrations yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {registrations.map(([id, registration]) => (
                      <button
                        key={id}
                        onClick={() => setSelectedRegistrationId(id)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                          selectedRegistrationId === id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{registration.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {registration.phone}
                            </p>
                          </div>
                          <Badge variant={registration.category === 'Residential' ? 'default' : 'secondary'}>
                            {registration.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <CreditCard className="w-3 h-3" />
                          {registration.paymentMethod}
                          <span>•</span>
                          <Wifi className="w-3 h-3" />
                          {registration.router}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Registration Details or Edit Form */}
          {isEditMode && selectedRegistration && selectedRegistrationId ? (
            <EditRegistrationDetailsForm
              registration={selectedRegistration}
              registrationId={selectedRegistrationId}
              onSave={handleSaveChanges}
              onCancel={handleCancelEdit}
              isSaving={updateRegistrationMutation.isPending}
              error={updateError}
              success={updateSuccess}
            />
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  {selectedRegistration ? 'View customer registration information' : 'Select a registration to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRegistrationQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : !selectedRegistration ? (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No registration selected</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Edit button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={handleEditClick}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </Button>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                        <p className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {selectedRegistration.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {selectedRegistration.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Category</p>
                        <Badge variant={selectedRegistration.category === 'Residential' ? 'default' : 'secondary'}>
                          {selectedRegistration.category}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                        <p className="font-medium flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          {selectedRegistration.paymentMethod}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Router</p>
                        <p className="font-medium flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-muted-foreground" />
                          {selectedRegistration.router}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Payment Receipt</p>
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                          <Badge variant={hasReceipt ? 'default' : 'secondary'}>
                            {hasReceipt ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Terms Accepted At</p>
                        <p className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {formatTimestamp(selectedRegistration.termsAcceptedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Documents Uploaded</p>
                        <p className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {selectedRegistration.documents.length} document(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
