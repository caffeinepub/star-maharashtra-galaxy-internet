import type { Registration } from '../../../backend';

/**
 * Safely get a value from registration with fallback
 */
export function getValueOrFallback(value: string | undefined | null, fallback = 'Not provided'): string {
  if (!value || value.trim() === '') {
    return fallback;
  }
  return value;
}

/**
 * Build display name from registration personal info
 */
export function buildDisplayName(registration: Registration | null | undefined): string {
  if (!registration?.personalInfo) {
    return 'Unknown';
  }

  const { firstName, middleName, surname } = registration.personalInfo;
  const parts = [firstName, middleName, surname].filter(
    (part) => part && part.trim() !== ''
  );

  return parts.length > 0 ? parts.join(' ') : 'Unknown';
}

/**
 * Check if registration has missing or incomplete data
 */
export function getDataWarning(registration: Registration | null | undefined): string | undefined {
  if (!registration) {
    return undefined;
  }

  const issues: string[] = [];

  // Check personal info
  if (!registration.personalInfo) {
    issues.push('personal information');
  } else {
    const { firstName, surname, dateOfBirth, emailId, address } = registration.personalInfo;
    if (!firstName || !surname) {
      issues.push('name fields');
    }
    if (!dateOfBirth) {
      issues.push('date of birth');
    }
    if (!emailId) {
      issues.push('email');
    }
    if (!address) {
      issues.push('address');
    }
  }

  // Check documents
  if (!registration.documents || registration.documents.length < 2) {
    issues.push('verification documents');
  }

  // Check receipt for UPI payments
  if (registration.paymentMethod === 'UPI' && !registration.receipt) {
    issues.push('payment receipt');
  }

  if (issues.length === 0) {
    return undefined;
  }

  return `This submission was created with an older version and may not include all fields. Missing: ${issues.join(', ')}.`;
}

/**
 * Format timestamp to readable date string
 */
export function formatTimestamp(timestamp: bigint): string {
  try {
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get document by index with safe access
 */
export function getDocumentByIndex(
  registration: Registration | null | undefined,
  index: number
): any | null {
  if (!registration?.documents || registration.documents.length <= index) {
    return null;
  }
  return registration.documents[index];
}

/**
 * Check if receipt exists
 */
export function hasReceipt(registration: Registration | null | undefined): boolean {
  return !!registration?.receipt;
}
