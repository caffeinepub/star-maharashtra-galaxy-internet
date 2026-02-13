import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminQueries } from './hooks/useAdminQueries';
import { useAdminSetupCode } from './hooks/useAdminSetupCode';
import { useAdminPasswordLogin } from './hooks/useAdminPasswordLogin';
import { AdminAccessRecoveryCard } from './components/AdminAccessRecoveryCard';
import { EditRegistrationDetailsForm } from './components/EditRegistrationDetailsForm';
import { RegistrationDetailPanel } from './components/RegistrationDetailPanel';
import { AdminDetailErrorBoundary } from './components/AdminDetailErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  User, 
  Phone,
  FileText,
} from 'lucide-react';
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
    deleteRegistrationMutation,
  } = useAdminQueries();
  
  const {
    applyAdminSetupCode,
    isApplying,
    isSuccess: codeAppliedSuccess,
    isError: codeAppliedError,
    error: codeError,
    reset: resetCodeMutation,
  } = useAdminSetupCode();

  const passwordLoginMutation = useAdminPasswordLogin();

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [showClaimUI, setShowClaimUI] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [recheckAttempts, setRecheckAttempts] = useState(0);
  const [showAccessStillDenied, setShowAccessStillDenied] = useState(false);
  const [wasPasswordLogin, setWasPasswordLogin] = useState(false);
  const [passwordRecheckAttempts, setPasswordRecheckAttempts] = useState(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const selectedRegistrationQuery = useRegistrationWithReceiptQuery(selectedRegistrationId);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isAdmin = isAdminQuery.data === true;
  const isGuest = userRoleQuery.data === 'guest';

  // Extract registration data with safe defaults
  const registrationData = selectedRegistrationQuery.data?.registration || null;
  const hasReceipt = selectedRegistrationQuery.data?.hasReceipt || false;
  const dataWarning = selectedRegistrationQuery.data?.error;

  // Get selected registration summary from list for fallback display
  const selectedRegistrationSummary = registrationsQuery.data?.find(
    ([id]) => id === selectedRegistrationId
  );
  const selectedRegistrationName = selectedRegistrationSummary?.[1]?.name;
  const selectedRegistrationPhone = selectedRegistrationSummary?.[1]?.phone;

  // Check if we should show the claim UI
  useEffect(() => {
    if (isAuthenticated && !isAdminQuery.isLoading && !userRoleQuery.isLoading) {
      setShowClaimUI(isGuest && !isAdmin);
    }
  }, [isAuthenticated, isAdmin, isGuest, isAdminQuery.isLoading, userRoleQuery.isLoading]);

  // When admin setup code is successfully applied, start re-checking admin status
  useEffect(() => {
    if (codeAppliedSuccess && !isAdmin && recheckAttempts < 5) {
      const timer = setTimeout(() => {
        setRecheckAttempts(prev => prev + 1);
        isAdminQuery.refetch();
        userRoleQuery.refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [codeAppliedSuccess, isAdmin, recheckAttempts, isAdminQuery, userRoleQuery]);

  // If admin status becomes true after code apply, reset and clear success message
  useEffect(() => {
    if (codeAppliedSuccess && isAdmin) {
      setRecheckAttempts(0);
      setShowAccessStillDenied(false);
      const timer = setTimeout(() => {
        resetCodeMutation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeAppliedSuccess, isAdmin, resetCodeMutation]);

  // If we've tried multiple times and still not admin, show troubleshooting
  useEffect(() => {
    if (codeAppliedSuccess && !isAdmin && recheckAttempts >= 5) {
      setShowAccessStillDenied(true);
    }
  }, [codeAppliedSuccess, isAdmin, recheckAttempts]);

  // When password login succeeds, start aggressive re-checking admin status
  useEffect(() => {
    if (passwordLoginMutation.isSuccess && !isAdmin && passwordRecheckAttempts < 10) {
      setWasPasswordLogin(true);
      const timer = setTimeout(() => {
        setPasswordRecheckAttempts(prev => prev + 1);
        isAdminQuery.refetch();
        userRoleQuery.refetch();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [passwordLoginMutation.isSuccess, isAdmin, passwordRecheckAttempts, isAdminQuery, userRoleQuery]);

  // Auto-select first registration after password login when admin becomes authorized
  useEffect(() => {
    if (wasPasswordLogin && isAdmin) {
      // Reset recheck attempts
      setPasswordRecheckAttempts(0);
      
      // Fetch registrations
      registrationsQuery.refetch().then(() => {
        if (registrationsQuery.data && registrationsQuery.data.length > 0 && !selectedRegistrationId) {
          const firstRegistrationId = registrationsQuery.data[0][0];
          setSelectedRegistrationId(firstRegistrationId);
        }
      });
      
      // Reset flag after handling
      setWasPasswordLogin(false);
    }
  }, [wasPasswordLogin, isAdmin, registrationsQuery, selectedRegistrationId]);

  // Reset password recheck attempts when mutation resets
  useEffect(() => {
    if (!passwordLoginMutation.isSuccess) {
      setPasswordRecheckAttempts(0);
      setWasPasswordLogin(false);
    }
  }, [passwordLoginMutation.isSuccess]);

  // Reset edit mode when selection changes
  useEffect(() => {
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
    setDeleteError(null);
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

  // Reset password login flag on sign out
  useEffect(() => {
    if (!isAuthenticated) {
      setWasPasswordLogin(false);
      setPasswordRecheckAttempts(0);
    }
  }, [isAuthenticated]);

  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1_000_000);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setSelectedRegistrationId(null);
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
    setDeleteError(null);
    setRecheckAttempts(0);
    setPasswordRecheckAttempts(0);
    setShowAccessStillDenied(false);
    setWasPasswordLogin(false);
    resetCodeMutation();
    passwordLoginMutation.reset();
    await clear();
    queryClient.clear();
  };

  // Handle admin setup code application
  const handleApplyCode = async (code: string) => {
    setRecheckAttempts(0);
    setShowAccessStillDenied(false);
    await applyAdminSetupCode(code);
  };

  // Handle password login
  const handlePasswordLogin = async (username: string, password: string) => {
    setPasswordRecheckAttempts(0);
    setWasPasswordLogin(false);
    await passwordLoginMutation.mutateAsync({ username, password });
  };

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    setDeleteError(null);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  // Handle edit save
  const handleEditSave = async (data: {
    name: string;
    category: string;
    paymentMethod: string;
    router: string;
  }) => {
    if (!selectedRegistrationId) return;

    try {
      await updateRegistrationMutation.mutateAsync({
        id: selectedRegistrationId,
        ...data,
      });
      setUpdateSuccess(true);
      setUpdateError(null);
      setIsEditMode(false);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update registration');
      setUpdateSuccess(false);
    }
  };

  // Handle delete registration
  const handleDelete = async () => {
    if (!selectedRegistrationId) return;

    setDeleteError(null);

    try {
      await deleteRegistrationMutation.mutateAsync(selectedRegistrationId);
      
      // After successful deletion, refetch registrations and update selection
      await registrationsQuery.refetch();
      
      // Move selection to first remaining registration or null
      if (registrationsQuery.data && registrationsQuery.data.length > 0) {
        const firstRegistrationId = registrationsQuery.data[0][0];
        setSelectedRegistrationId(firstRegistrationId);
      } else {
        setSelectedRegistrationId(null);
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete registration');
    }
  };

  // Handle error boundary retry
  const handleErrorBoundaryRetry = () => {
    // Clear edit mode if stuck
    setIsEditMode(false);
    setUpdateSuccess(false);
    setUpdateError(null);
    setDeleteError(null);
    
    // Refetch the selected registration
    if (selectedRegistrationId) {
      selectedRegistrationQuery.refetch();
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-theme-wrapper">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="admin-card max-w-md w-full shadow-lg border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>
                Sign in with Internet Identity to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onNavigateToRegistration}
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while checking admin status
  if (isAdminQuery.isLoading || userRoleQuery.isLoading) {
    return (
      <div className="admin-theme-wrapper">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show claim UI for first-time admin
  if (showClaimUI && !claimAdminMutation.isSuccess) {
    return (
      <div className="admin-theme-wrapper">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="admin-card max-w-md w-full shadow-lg border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">Claim Admin Access</CardTitle>
              <CardDescription>
                You are the first user. Click below to become the admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => claimAdminMutation.mutate()}
                disabled={claimAdminMutation.isPending}
                className="w-full gap-2"
              >
                {claimAdminMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming admin access...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Claim Admin Access
                  </>
                )}
              </Button>
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
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show neutral loading state while verifying admin access after password login
  if (passwordLoginMutation.isSuccess && !isAdmin) {
    return (
      <div className="admin-theme-wrapper">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access recovery UI if not admin
  if (!isAdmin) {
    return (
      <div className="admin-theme-wrapper">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <AdminAccessRecoveryCard
              onApplyCode={handleApplyCode}
              onSignOut={handleSignOut}
              onPasswordLogin={handlePasswordLogin}
              isApplying={isApplying}
              isPasswordLoggingIn={passwordLoginMutation.isPending}
              error={codeAppliedError ? (codeError instanceof Error ? codeError.message : 'Failed to apply code') : null}
              passwordError={passwordLoginMutation.isError ? (passwordLoginMutation.error instanceof Error ? passwordLoginMutation.error.message : 'Login failed') : null}
              success={codeAppliedSuccess && !showAccessStillDenied}
              passwordSuccess={false}
              isAdmin={isAdmin}
            />
            {showAccessStillDenied && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Still Denied</AlertTitle>
                <AlertDescription>
                  The setup code was applied, but admin access could not be verified. This may indicate:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>The code was for a different Internet Identity</li>
                    <li>The code has already been used</li>
                    <li>There was a system error</li>
                  </ul>
                  <div className="mt-3">
                    <strong>Next steps:</strong> Check the "Current Status" section above to verify your signed-in principal matches the expected admin identity, or contact support.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel UI
  const principal = identity?.getPrincipal().toString() || 'Unknown';
  
  return (
    <div className="admin-theme-wrapper">
      {/* Header */}
      <header className="admin-header border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Manage customer registrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <Badge variant="outline" className="font-mono text-xs max-w-[200px] truncate" title={principal}>
                  {principal}
                </Badge>
              </div>
              <Badge variant="default" className="hidden sm:flex">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Registration List */}
          <div className="lg:col-span-1">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Registrations
                </CardTitle>
                <CardDescription>
                  {registrationsQuery.data?.length || 0} total registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registrationsQuery.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {registrationsQuery.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {registrationsQuery.error instanceof Error
                        ? registrationsQuery.error.message
                        : 'Failed to load registrations'}
                    </AlertDescription>
                  </Alert>
                )}

                {registrationsQuery.data && registrationsQuery.data.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No registrations yet</p>
                  </div>
                )}

                {registrationsQuery.data && registrationsQuery.data.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-2">
                      {registrationsQuery.data.map(([id, registration]) => (
                        <button
                          key={id}
                          onClick={() => setSelectedRegistrationId(id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedRegistrationId === id
                              ? 'bg-primary/20 border-primary'
                              : 'hover:bg-accent border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <p className="font-medium truncate">{registration.name}</p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <p className="truncate">{registration.phone}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Registration Details or Edit Form */}
          <div className="lg:col-span-2">
            <AdminDetailErrorBoundary onRetry={handleErrorBoundaryRetry}>
              {!selectedRegistrationId ? (
                <Card className="admin-card">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center text-muted-foreground">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select a registration to view details</p>
                    </div>
                  </CardContent>
                </Card>
              ) : isEditMode && registrationData ? (
                <EditRegistrationDetailsForm
                  registration={registrationData}
                  registrationId={selectedRegistrationId}
                  onCancel={handleEditCancel}
                  onSave={handleEditSave}
                  isSaving={updateRegistrationMutation.isPending}
                  success={updateSuccess}
                  error={updateError}
                />
              ) : (
                <RegistrationDetailPanel
                  selectedRegistrationId={selectedRegistrationId}
                  isLoading={selectedRegistrationQuery.isLoading}
                  isFetching={selectedRegistrationQuery.isFetching}
                  isError={selectedRegistrationQuery.isError}
                  error={selectedRegistrationQuery.error}
                  registration={registrationData}
                  hasReceipt={hasReceipt}
                  isAdmin={isAdmin}
                  isEditMode={isEditMode}
                  onEditClick={handleEditClick}
                  onRefetch={() => selectedRegistrationQuery.refetch()}
                  formatTimestamp={formatTimestamp}
                  totalRegistrations={registrationsQuery.data?.length || 0}
                  onDelete={handleDelete}
                  isDeleting={deleteRegistrationMutation.isPending}
                  deleteError={deleteError}
                  dataWarning={dataWarning}
                  selectedRegistrationName={selectedRegistrationName}
                  selectedRegistrationPhone={selectedRegistrationPhone}
                />
              )}
            </AdminDetailErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
