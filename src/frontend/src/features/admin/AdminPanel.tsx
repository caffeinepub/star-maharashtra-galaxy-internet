import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminQueries } from './hooks/useAdminQueries';
import { useAdminSetupCode } from './hooks/useAdminSetupCode';
import { AdminAccessRecoveryCard } from './components/AdminAccessRecoveryCard';
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
  CheckCircle2
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
    useRegistrationQuery 
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
  const selectedRegistration = useRegistrationQuery(selectedRegistrationId);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
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
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Admin info banner */}
        <div className="mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Principal: <code className="text-xs bg-muted px-2 py-1 rounded">{principalString}</code>
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {registrations.length} {registrations.length === 1 ? 'registration' : 'registrations'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading state */}
        {registrationsQuery.isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading registrations...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
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

        {/* Empty state */}
        {!registrationsQuery.isLoading && !registrationsQuery.isError && registrations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Customer registrations will appear here once they complete the registration process.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Registrations list */}
        {!registrationsQuery.isLoading && !registrationsQuery.isError && registrations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List of registrations */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">All Registrations</h2>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {registrations.map(([id, registration]) => (
                    <Card
                      key={id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedRegistrationId === id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRegistrationId(id)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{registration.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{registration.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary">{registration.category}</Badge>
                            </div>
                          </div>
                          {selectedRegistrationId === id && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Selected registration details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Registration Details</h2>
              {selectedRegistrationId ? (
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="pr-4">
                    {selectedRegistration.isLoading && (
                      <Card>
                        <CardContent className="flex items-center justify-center py-16">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </CardContent>
                      </Card>
                    )}

                    {selectedRegistration.isError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Failed to load registration details
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedRegistration.data && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Personal Info */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Personal Details
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Name:</span>
                                <span>{selectedRegistration.data.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Phone:</span>
                                <span>{selectedRegistration.data.phone}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Service Details */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Service Details
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Category:</span>
                                <Badge variant="secondary">{selectedRegistration.data.category}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Payment:</span>
                                <span>{selectedRegistration.data.paymentMethod}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Router:</span>
                                <span>{selectedRegistration.data.router}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Terms Acceptance */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Terms & Conditions
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>Accepted on {formatTimestamp(selectedRegistration.data.termsAcceptedAt)}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Documents */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Uploaded Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {selectedRegistration.data.documents.map((doc, index) => (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-medium">
                                    {index === 0 ? 'Aadhaar Card' : 'PAN Card'}
                                  </p>
                                  <a
                                    href={doc.getDirectURL()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={doc.getDirectURL()}
                                      alt={index === 0 ? 'Aadhaar Card' : 'PAN Card'}
                                      className="w-full h-32 object-cover rounded border hover:opacity-80 transition-opacity"
                                    />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Select a registration from the list to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
