import type { CustomerDetailsData } from './types';

export function validateCustomerDetails(data: CustomerDetailsData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!data.surname.trim()) {
    errors.surname = 'Surname is required';
  }

  // Phone validation
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  // Date of birth validation
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      errors.dateOfBirth = 'You must be at least 18 years old';
    }
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Address validation
  if (!data.address.trim()) {
    errors.address = 'Address is required';
  } else if (data.address.trim().length < 10) {
    errors.address = 'Please enter a complete address (minimum 10 characters)';
  }

  return errors;
}
