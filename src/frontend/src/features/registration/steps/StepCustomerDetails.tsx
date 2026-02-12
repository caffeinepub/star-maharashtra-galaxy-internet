import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { StepProps, CustomerDetailsData } from '../types';
import { validateCustomerDetails } from '../validation';

export function StepCustomerDetails({ onValidationChange }: StepProps) {
  const [formData, setFormData] = useState<CustomerDetailsData>({
    firstName: '',
    middleName: '',
    surname: '',
    phone: '',
    dateOfBirth: '',
    email: '',
    address: '',
    category: 'Residential',
    paymentOption: 'Cash',
    routerProvision: 'Free',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const validationErrors = validateCustomerDetails(formData);
    setErrors(validationErrors);
    const isValid = Object.keys(validationErrors).length === 0;
    onValidationChange(isValid, isValid ? formData : undefined);
  }, [formData, onValidationChange]);

  const handleChange = (field: keyof CustomerDetailsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
              placeholder="Enter middle name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">
              Surname <span className="text-destructive">*</span>
            </Label>
            <Input
              id="surname"
              value={formData.surname}
              onChange={(e) => handleChange('surname', e.target.value)}
              placeholder="Enter surname"
              className={errors.surname ? 'border-destructive' : ''}
            />
            {errors.surname && (
              <p className="text-xs text-destructive">{errors.surname}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className={errors.dateOfBirth ? 'border-destructive' : ''}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter complete address"
            rows={3}
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address}</p>
          )}
        </div>
      </div>

      {/* Customer Category */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Customer Category <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.category}
          onValueChange={(value) => handleChange('category', value)}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="Residential" id="residential" />
            <Label htmlFor="residential" className="flex-1 cursor-pointer">
              Residential Customer
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="Commercial" id="commercial" />
            <Label htmlFor="commercial" className="flex-1 cursor-pointer">
              Commercial Customer
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Payment Option */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Payment Option <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.paymentOption}
          onValueChange={(value) => handleChange('paymentOption', value)}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="Cash" id="cash" />
            <Label htmlFor="cash" className="flex-1 cursor-pointer">
              Cash
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="UPI" id="upi" />
            <Label htmlFor="upi" className="flex-1 cursor-pointer">
              UPI
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Router Provision */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Router Provision <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.routerProvision}
          onValueChange={(value) => handleChange('routerProvision', value)}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="Free" id="free" />
            <Label htmlFor="free" className="flex-1 cursor-pointer">
              Provided Free of Cost
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="Chargeable" id="chargeable" />
            <Label htmlFor="chargeable" className="flex-1 cursor-pointer">
              Chargeable
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
