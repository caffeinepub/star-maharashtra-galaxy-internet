import type { ExternalBlob } from '../../backend';

export interface CustomerDetailsData {
  firstName: string;
  middleName: string;
  surname: string;
  phone: string;
  dateOfBirth: string;
  email: string;
  address: string;
  category: 'Residential' | 'Commercial';
  paymentOption: 'Cash' | 'UPI';
  routerProvision: 'Free' | 'Chargeable';
}

export interface DocumentsData {
  aadhaarCard: File;
  panCard: File;
  paymentReceipt?: File;
  applicantPhoto?: File;
}

export interface StepProps {
  onValidationChange: (isValid: boolean, data?: any) => void;
  customerDetails?: CustomerDetailsData | null;
  documents?: DocumentsData | null;
  termsAcceptedAt?: bigint | null;
}
