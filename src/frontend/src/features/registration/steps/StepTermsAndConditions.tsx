import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { StepProps } from '../types';
import { TERMS_AND_CONDITIONS } from '../terms';

export function StepTermsAndConditions({ onValidationChange }: StepProps) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (agreed) {
      const timestamp = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
      onValidationChange(true, { timestamp });
    } else {
      onValidationChange(false);
    }
  }, [agreed, onValidationChange]);

  return (
    <div className="space-y-6">
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
    </div>
  );
}
