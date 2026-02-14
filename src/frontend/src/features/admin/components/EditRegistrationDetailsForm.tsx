import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, CheckCircle2, Save, X } from 'lucide-react';
import type { Registration } from '../../../backend';
import { useUpdateCustomerRegistration } from '../hooks/useAdminQueries';

interface EditRegistrationDetailsFormProps {
  registration: Registration;
  registrationId: string;
  onCancel: () => void;
}

export function EditRegistrationDetailsForm({
  registration,
  registrationId,
  onCancel,
}: EditRegistrationDetailsFormProps) {
  const [category, setCategory] = useState(registration.category);
  const [paymentMethod, setPaymentMethod] = useState(registration.paymentMethod);
  const [router, setRouter] = useState(registration.router);

  const updateMutation = useUpdateCustomerRegistration();

  // Reset form when registration changes
  useEffect(() => {
    setCategory(registration.category);
    setPaymentMethod(registration.paymentMethod);
    setRouter(registration.router);
  }, [registration]);

  const hasChanges =
    category !== registration.category ||
    paymentMethod !== registration.paymentMethod ||
    router !== registration.router;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    try {
      await updateMutation.mutateAsync({
        id: registrationId,
        category,
        paymentMethod,
        router,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Card className="admin-card shadow-lg border">
      <CardHeader>
        <CardTitle>Edit Registration</CardTitle>
        <CardDescription>ID: {registrationId}</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {updateMutation.isSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Registration updated successfully</AlertDescription>
              </Alert>
            )}

            {updateMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : 'Failed to update registration'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="router">Router Provision</Label>
                <Select value={router} onValueChange={setRouter}>
                  <SelectTrigger id="router">
                    <SelectValue placeholder="Select router provision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Chargeable">Chargeable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex gap-2 justify-end border-t pt-4 sticky bottom-0 bg-card">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!hasChanges || updateMutation.isPending}
          className="gap-2"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
