import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminQueries } from './hooks/useAdminQueries';
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

interface AdminPanelProps {
  onNavigateToRegistration: () => void;
}

export function AdminPanel({ onNavigateToRegistration }: AdminPanelProps) {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const { 
    isAdminQuery, 
    userRoleQuery,
    claimAdminMutation, 
    registrationsQuery,
    useRegistrationQuery 
  } = useAdminQueries();
  
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [showClaimUI, setShowClaimUI] = useState(false);
  const selectedRegistration = useRegistrationQuery(selectedRegistrationId);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isAdmin = isAdminQuery.data === true;
  const isGuest = userRoleQuery.data === 'guest';

  // Check if we should show the claim UI
  // Show claim UI only if authenticated, not admin, and is guest
  useEffect(() => {
    if (isAuthenticated && !isAdminQuery.isLoading && !userRoleQuery.isLoading) {
      setShowClaimUI(isGuest && !isAdmin);
    }
  }, [isAuthenticated, isAdmin, isGuest, isAdminQuery.isLoading, userRoleQuery.isLoading]);

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

  // Render: Access denied (not admin)
  if (isAuthenticated && !isAdmin && !showClaimUI) {
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
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription>
                You do not have permission to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Only authorized administrators can view customer submissions.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render: Admin view with registrations list
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrations List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Customer Registrations
              </CardTitle>
              <CardDescription>
                {registrationsQuery.isLoading
                  ? 'Loading submissions...'
                  : `${registrationsQuery.data?.length || 0} total submissions`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationsQuery.isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

              {registrationsQuery.isSuccess && registrationsQuery.data.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No customer registrations yet</p>
                </div>
              )}

              {registrationsQuery.isSuccess && registrationsQuery.data.length > 0 && (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {registrationsQuery.data.map(([id, registration]) => (
                      <Card
                        key={id}
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                          selectedRegistrationId === id ? 'border-primary bg-accent/30' : ''
                        }`}
                        onClick={() => setSelectedRegistrationId(id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{registration.name}</span>
                            </div>
                            <Badge variant="outline">{registration.category}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{registration.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3 h-3" />
                              <span>{registration.paymentMethod}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Registration Details */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Registration Details
              </CardTitle>
              <CardDescription>
                {selectedRegistrationId
                  ? 'View complete registration information'
                  : 'Select a registration to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedRegistrationId && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a registration from the list to view details</p>
                </div>
              )}

              {selectedRegistrationId && selectedRegistration.isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {selectedRegistrationId && selectedRegistration.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load registration details
                  </AlertDescription>
                </Alert>
              )}

              {selectedRegistrationId && selectedRegistration.isSuccess && selectedRegistration.data && (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selectedRegistration.data.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{selectedRegistration.data.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <Badge variant="outline">{selectedRegistration.data.category}</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Service Details */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Service Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="font-medium">{selectedRegistration.data.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Router:</span>
                          <span className="font-medium">{selectedRegistration.data.router}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Terms Acceptance */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Terms Acceptance
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accepted at:</span>
                          <span className="font-medium">
                            {formatTimestamp(selectedRegistration.data.termsAcceptedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Documents */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Verification Documents
                      </h3>
                      <div className="space-y-3">
                        {selectedRegistration.data.documents.map((doc, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {index === 0 ? 'Aadhaar Card' : 'PAN Card'}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const url = doc.getDirectURL();
                                  window.open(url, '_blank');
                                }}
                              >
                                View Document
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Star Maharashtra Galaxy Internet. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'star-maharashtra-galaxy'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
