import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Save } from 'lucide-react';
import type { Registration } from '../../../backend';

interface EditRegistrationDetailsFormProps {
  registration: Registration;
  registrationId: string;
  onSave: (data: {
    name: string;
    category: string;
    paymentMethod: string;
    router: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  success: boolean;
}

export function EditRegistrationDetailsForm({
  registration,
  registrationId,
  onSave,
  onCancel,
  isSaving,
  error,
  success,
}: EditRegistrationDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: registration.name,
    category: registration.category,
    paymentMethod: registration.paymentMethod,
    router: registration.router,
  });

  // Reset form data when registration changes
  useEffect(() => {
    setFormData({
      name: registration.name,
      category: registration.category,
      paymentMethod: registration.paymentMethod,
      router: registration.router,
    });
  }, [registration.name, registration.category, registration.paymentMethod, registration.router, registrationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const hasChanges = 
    formData.name !== registration.name ||
    formData.category !== registration.category ||
    formData.paymentMethod !== registration.paymentMethod ||
    formData.router !== registration.router;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Edit Registration Details</CardTitle>
        <CardDescription>
          Update customer information for this registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only fields */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Registration ID</Label>
                <Input
                  value={registrationId}
                  disabled
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Phone Number</Label>
                <Input
                  value={registration.phone}
                  disabled
                  className="bg-background"
                />
              </div>
            </div>

            <Separator />

            {/* Editable fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isSaving}
                >
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
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI (PhonePe/Google Pay)">UPI (PhonePe/Google Pay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="router">Router *</Label>
                <Select
                  value={formData.router}
                  onValueChange={(value) => setFormData({ ...formData, router: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="router">
                    <SelectValue placeholder="Select router" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Provided by Company">Provided by Company</SelectItem>
                    <SelectItem value="Customer's Own Router">Customer's Own Router</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-600 dark:text-green-400">Success</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">
                  Changes saved successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="flex-1 gap-2"
              >
                {isSaving ? (
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
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
