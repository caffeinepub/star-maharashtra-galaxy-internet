import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Key, Loader2, LogOut, CheckCircle2 } from 'lucide-react';

interface AdminAccessRecoveryCardProps {
  onApplyCode: (code: string) => void;
  onSignOut: () => void;
  isApplying: boolean;
  error: string | null;
  success: boolean;
}

export function AdminAccessRecoveryCard({
  onApplyCode,
  onSignOut,
  isApplying,
  error,
  success,
}: AdminAccessRecoveryCardProps) {
  const [adminCode, setAdminCode] = useState('');

  const handleApply = () => {
    if (adminCode.trim()) {
      onApplyCode(adminCode.trim());
    }
  };

  return (
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
      <CardContent className="space-y-6">
        <div className="text-center text-muted-foreground">
          <p>Only authorized administrators can view customer submissions.</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Admin Access Recovery</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Admin Setup Code to gain access
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Setup Code</Label>
              <Input
                id="adminCode"
                type="text"
                placeholder="Enter your Admin Setup Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                disabled={isApplying || success}
                className="font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminCode.trim() && !isApplying && !success) {
                    handleApply();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleApply}
              disabled={!adminCode.trim() || isApplying || success}
              className="w-full gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying Code...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Code Applied Successfully
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Apply Admin Setup Code
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="font-semibold mb-2">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Verify you have the correct Admin Setup Code</li>
                      <li>Ensure you're signed in with the admin Internet Identity</li>
                      <li>Check that the code hasn't expired or been changed</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-600 dark:text-green-400">Success</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">
                  Admin access granted. Refreshing panel...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lost your Admin Setup Code?</AlertTitle>
            <AlertDescription className="text-sm">
              The Admin Setup Code was provided when the admin was first configured. If you've lost it, you'll need to contact the system administrator or redeploy the application to reset admin access.
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Signed in with a different account?
          </p>
          <Button
            onClick={onSignOut}
            variant="outline"
            className="w-full gap-2"
            disabled={isApplying}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
