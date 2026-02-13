import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Info } from 'lucide-react';
import type { StepProps } from '../types';
import { TERMS_AND_CONDITIONS } from '../terms';
import { sanitizeUrlForPrint } from '@/utils/urlParams';

export function StepTermsAndConditions({ onValidationChange, customerDetails, termsAcceptedAt }: StepProps) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (agreed) {
      const timestamp = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
      onValidationChange(true, { timestamp });
    } else {
      onValidationChange(false);
    }
  }, [agreed, onValidationChange]);

  const handlePrint = () => {
    // Sanitize URL before printing to prevent sensitive tokens from appearing in PDF
    sanitizeUrlForPrint('caffeineAdminToken');
    
    // Set up event listeners to keep URL sanitized during print lifecycle
    const handleBeforePrint = () => {
      sanitizeUrlForPrint('caffeineAdminToken');
    };

    const handleAfterPrint = () => {
      sanitizeUrlForPrint('caffeineAdminToken');
      // Clean up listeners
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    // Add listeners for print lifecycle
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Small delay to ensure URL update is processed before print dialog
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const formatAcceptanceDate = () => {
    if (!termsAcceptedAt) return '';
    // Convert nanoseconds to milliseconds
    const milliseconds = Number(termsAcceptedAt / BigInt(1_000_000));
    const date = new Date(milliseconds);
    return date.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'long',
    });
  };

  const getCustomerFullName = () => {
    if (!customerDetails) return '';
    return `${customerDetails.firstName} ${customerDetails.middleName} ${customerDetails.surname}`.trim();
  };

  return (
    <div className="space-y-6">
      {/* Print-only proof document */}
      <div className="print-only">
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold mb-2">Terms and Conditions Acceptance Proof</h1>
            <p className="text-sm text-muted-foreground">Star Maharashtra Galaxy Internet</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {getCustomerFullName()}</p>
                <p><strong>Phone:</strong> {customerDetails?.phone || ''}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-sm mb-2">Acceptance Details</h3>
              <p className="text-sm">
                <strong>Accepted on:</strong> {formatAcceptanceDate()}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
              <div className="space-y-4">
                {TERMS_AND_CONDITIONS.map((section, index) => (
                  <div key={index} className="space-y-2">
                    {section.title && (
                      <h4 className="font-semibold text-sm">{section.title}</h4>
                    )}
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-3 text-sm">
                          <span className="font-bold mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* On-screen view */}
      <div className="no-print">
        <ScrollArea className="h-[400px] rounded-lg border p-6 bg-muted/30">
          <div className="space-y-6 pr-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please read the following terms and conditions carefully before proceeding with your
                registration.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {TERMS_AND_CONDITIONS.map((section, index) => (
                <div key={index} className="space-y-2">
                  {section.title && (
                    <h4 className="font-semibold text-sm">{section.title}</h4>
                  )}
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex gap-3 text-sm">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-3 p-4 border rounded-lg bg-accent/20">
          <Checkbox
            id="terms-agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <div className="flex-1">
            <Label
              htmlFor="terms-agreement"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I have read and agree to the Terms and Conditions{' '}
              <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              You must accept the terms and conditions to proceed with registration
            </p>
          </div>
        </div>

        {/* Print/Save Proof Button with helper note */}
        <div className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!agreed}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save Proof
            </Button>
          </div>

          {/* Helper note for disabling browser headers/footers */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> If a website link appears in your saved PDF, you can disable it by unchecking the "Headers and footers" option in your browser's print dialog before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
