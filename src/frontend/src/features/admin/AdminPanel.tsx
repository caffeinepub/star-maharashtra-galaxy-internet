import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  User,
  Phone,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetRegistrations,
  useDeleteCustomerRegistration,
  useCheckIsAdmin,
} from './hooks/useAdminQueries';
import { EditRegistrationDetailsForm } from './components/EditRegistrationDetailsForm';
import { RegistrationDetailPanel } from './components/RegistrationDetailPanel';
import { AdminPanelErrorBoundary } from './components/AdminPanelErrorBoundary';
import { AdminDetailErrorBoundary } from './components/AdminDetailErrorBoundary';
import { getDataWarning, buildDisplayName } from './utils/registrationDetails';

interface AdminPanelProps {
  onBackToRegistration: () => void;
}

export default function AdminPanel({ onBackToRegistration }: AdminPanelProps) {
  const { identity, clear: clearIdentity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    data: adminCheckData,
    isLoading: isCheckingAdmin,
    isError: isAdminCheckError,
    error: adminCheckError,
    refetch: refetchAdminCheck,
  } = useCheckIsAdmin();

  const isAdmin = adminCheckData?.isAdmin ?? false;
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const {
    data: registrationsData,
    isLoading: isLoadingRegistrations,
    isFetching: isFetchingRegistrations,
    isError: isRegistrationsError,
    error: registrationsError,
    refetch: refetchRegistrations,
  } = useGetRegistrations(isAdmin);

  const registrations = registrationsData || [];

  const deleteRegistrationMutation = useDeleteCustomerRegistration();

  const selectedRegistration = registrations.find(([id]) => id === selectedRegistrationId)?.[1];

  const hasReceipt = selectedRegistration?.receipt !== null && selectedRegistration?.receipt !== undefined;

  useEffect(() => {
    if (registrations.length > 0 && !selectedRegistrationId) {
      setSelectedRegistrationId(registrations[0][0]);
    }
  }, [registrations, selectedRegistrationId]);

  useEffect(() => {
    if (selectedRegistrationId) {
      const exists = registrations.some(([id]) => id === selectedRegistrationId);
      if (!exists && registrations.length > 0) {
        setSelectedRegistrationId(registrations[0][0]);
      } else if (!exists) {
        setSelectedRegistrationId(null);
      }
    }
  }, [registrations, selectedRegistrationId]);

  const handleSignOut = async () => {
    await clearIdentity();
    queryClient.clear();
  };

  const handleDelete = async () => {
    if (!selectedRegistrationId) return;

    try {
      await deleteRegistrationMutation.mutateAsync(selectedRegistrationId);
      setSelectedRegistrationId(null);
      setIsEditMode(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatTimestamp = (timestamp: bigint): string => {
    try {
      const milliseconds = Number(timestamp) / 1_000_000;
      const date = new Date(milliseconds);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const selectedRegistrationName = selectedRegistration
    ? buildDisplayName(selectedRegistration)
    : undefined;

  const selectedRegistrationPhone = selectedRegistration?.phone;

  const dataWarning = selectedRegistration ? getDataWarning(selectedRegistration) : undefined;

  if (isInitializing || isCheckingAdmin) {
    return (
      <div className="min-h-screen admin-panel-bg flex items-center justify-center p-4">
        <Card className="admin-card w-full max-w-md shadow-lg border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Initializing Admin Panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen admin-panel-bg flex items-center justify-center p-4">
        <Card className="admin-card w-full max-w-md shadow-lg border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-destructive" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You must be signed in with Internet Identity to access the Admin Panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Signed In</AlertTitle>
              <AlertDescription>
                Please return to the registration page and sign in with Internet Identity first.
              </AlertDescription>
            </Alert>
            <Button onClick={onBackToRegistration} className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdminCheckError || !isAdmin) {
    // Show access recovery card with both methods
    return (
      <div className="min-h-screen admin-panel-bg flex items-center justify-center p-4">
        <Card className="admin-card w-full max-w-2xl shadow-lg border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 text-destructive">
                <ShieldAlert className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have admin access. Use one of the methods below to gain access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show admin access recovery options */}
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Current Status</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Signed in as:</span>
                    <Badge variant="outline" className="font-mono text-xs max-w-[200px] truncate">
                      {identity?.getPrincipal().toString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Admin:</span>
                    <Badge variant={isAdmin ? "default" : "destructive"}>
                      {isAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={onBackToRegistration} variant="outline" className="flex-1 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Registration
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="flex-1 gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingRegistrations) {
    return (
      <div className="min-h-screen admin-panel-bg flex items-center justify-center p-4">
        <Card className="admin-card w-full max-w-md shadow-lg border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading customer registrations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isRegistrationsError) {
    return (
      <div className="min-h-screen admin-panel-bg flex items-center justify-center p-4">
        <Card className="admin-card w-full max-w-md shadow-lg border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-destructive" />
              Error Loading Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load Data</AlertTitle>
              <AlertDescription>
                {registrationsError instanceof Error
                  ? registrationsError.message
                  : 'An unexpected error occurred while loading customer registrations'}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => refetchRegistrations()} variant="outline" className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button onClick={onBackToRegistration} variant="outline" className="flex-1 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-panel-bg">
      <header className="admin-header border-b sticky top-0 z-10 backdrop-blur-sm bg-background/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage customer registrations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onBackToRegistration} variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Registration
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="admin-card shadow-lg border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Registrations
                </CardTitle>
                <CardDescription>
                  {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <CardContent className="space-y-2">
                  {registrations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No registrations yet</p>
                    </div>
                  ) : (
                    registrations.map(([id, reg]) => {
                      const displayName = buildDisplayName(reg);
                      const isSelected = id === selectedRegistrationId;

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedRegistrationId(id);
                            setIsEditMode(false);
                          }}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-sm'
                              : 'bg-card hover:bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium truncate">{displayName}</span>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">
                              {reg.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{id}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <AdminPanelErrorBoundary>
              <AdminDetailErrorBoundary onRetry={() => refetchRegistrations()}>
                {isEditMode && selectedRegistration ? (
                  <EditRegistrationDetailsForm
                    registration={selectedRegistration}
                    registrationId={selectedRegistrationId!}
                    onCancel={() => setIsEditMode(false)}
                  />
                ) : (
                  <RegistrationDetailPanel
                    selectedRegistrationId={selectedRegistrationId}
                    isLoading={false}
                    isFetching={isFetchingRegistrations}
                    isError={false}
                    error={null}
                    registration={selectedRegistration}
                    hasReceipt={hasReceipt}
                    isAdmin={isAdmin}
                    isEditMode={isEditMode}
                    onEditClick={() => setIsEditMode(true)}
                    onRefetch={refetchRegistrations}
                    formatTimestamp={formatTimestamp}
                    totalRegistrations={registrations.length}
                    onDelete={handleDelete}
                    isDeleting={deleteRegistrationMutation.isPending}
                    deleteError={
                      deleteRegistrationMutation.isError
                        ? deleteRegistrationMutation.error instanceof Error
                          ? deleteRegistrationMutation.error.message
                          : 'Failed to delete registration'
                        : null
                    }
                    dataWarning={dataWarning}
                    selectedRegistrationName={selectedRegistrationName}
                    selectedRegistrationPhone={selectedRegistrationPhone}
                  />
                )}
              </AdminDetailErrorBoundary>
            </AdminPanelErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
