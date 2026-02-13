import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Shield, LogOut, User, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';

interface AdminAccessRecoveryCardProps {
  onApplyCode: (code: string) => Promise<void>;
  onSignOut: () => void;
  onPasswordLogin: (username: string, password: string) => Promise<void>;
  isApplying: boolean;
  isPasswordLoggingIn: boolean;
  error: string | null;
  passwordError: string | null;
  success: boolean;
  passwordSuccess: boolean;
  isAdmin: boolean;
}

export function AdminAccessRecoveryCard({
  onApplyCode,
  onSignOut,
  onPasswordLogin,
  isApplying,
  isPasswordLoggingIn,
  error,
  passwordError,
  success,
  passwordSuccess,
  isAdmin,
}: AdminAccessRecoveryCardProps) {
  const [setupCode, setSetupCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { identity } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString() || 'Not signed in';
  const isAuthenticated = !!identity;

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCode.trim() || isApplying) return;
    
    try {
      await onApplyCode(setupCode.trim());
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isPasswordLoggingIn) return;
    
    try {
      await onPasswordLogin(username.trim(), password.trim());
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <Card className="admin-card shadow-lg border">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 text-destructive">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-2xl">Access Denied</CardTitle>
        <CardDescription>
          You do not have admin access. Use one of the methods below to gain access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diagnostics Section */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Current Status</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Signed in as:</span>
              <Badge variant="outline" className="font-mono text-xs max-w-[200px] truncate" title={principal}>
                {principal}
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

        {/* Important Notice */}
        {!isAuthenticated && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Internet Identity Required</AlertTitle>
            <AlertDescription>
              You must sign in with Internet Identity before using username/password or admin setup code.
              Please sign out and sign in with Internet Identity first.
            </AlertDescription>
          </Alert>
        )}

        {/* Username/Password Login Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Login with Username and Password</h3>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Step 1:</strong> Sign in with Internet Identity first (if not already signed in).<br />
              <strong>Step 2:</strong> Enter your admin username and password below.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPasswordLoggingIn || !isAuthenticated}
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPasswordLoggingIn || !isAuthenticated}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPasswordLoggingIn || !isAuthenticated}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!username.trim() || !password.trim() || isPasswordLoggingIn || !isAuthenticated}
              className="w-full gap-2"
            >
              {isPasswordLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {passwordError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {passwordError}
                {passwordError.includes('Internet Identity') && (
                  <div className="mt-2 text-sm">
                    <strong>Action required:</strong> Sign out and sign in with Internet Identity, then try again.
                  </div>
                )}
                {passwordError.includes('wait') && (
                  <div className="mt-2 text-sm">
                    <strong>Action required:</strong> Wait a few minutes before trying again.
                  </div>
                )}
                {passwordError.includes('Invalid') && (
                  <div className="mt-2 text-sm">
                    <strong>Troubleshooting:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Double-check your username and password</li>
                      <li>Ensure you are signed in with the correct Internet Identity</li>
                      <li>Check the "Current Status" section above to verify your principal</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Admin Setup Code Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Admin Setup Code</h3>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Have an Admin Setup Code?</AlertTitle>
            <AlertDescription>
              <strong>Step 1:</strong> Sign in with Internet Identity first (if not already signed in).<br />
              <strong>Step 2:</strong> Enter the admin setup code below to gain access.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleApplyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setupCode">Setup Code</Label>
              <Input
                id="setupCode"
                type="text"
                placeholder="Enter admin setup code"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value)}
                disabled={isApplying || !isAuthenticated}
              />
            </div>

            <Button
              type="submit"
              disabled={!setupCode.trim() || isApplying || !isAuthenticated}
              className="w-full gap-2"
              variant="secondary"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying code...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Apply Code
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes('not available') && (
                  <div className="mt-2 text-sm">
                    <strong>Action required:</strong> Sign in with Internet Identity first, then try again.
                  </div>
                )}
                {error.includes('Invalid') && (
                  <div className="mt-2 text-sm">
                    <strong>Troubleshooting:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Verify the code is correct</li>
                      <li>Ensure you are signed in with the correct Internet Identity</li>
                      <li>Check the "Current Status" section above to verify your principal</li>
                      <li>Contact the system administrator if the issue persists</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-950/50">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400">Code Applied Successfully</AlertTitle>
              <AlertDescription className="text-green-400">
                Verifying admin access...
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Sign Out Option */}
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
