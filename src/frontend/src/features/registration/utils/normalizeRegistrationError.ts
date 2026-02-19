/**
 * Normalizes registration-related errors into user-friendly English messages.
 * Converts backend traps, actor errors, and other exceptions into actionable guidance.
 */
export function normalizeRegistrationError(error: unknown): Error {
  // If already a normalized Error, return it
  if (error instanceof Error && error.message.startsWith('[Registration]')) {
    return error;
  }

  // Extract message from various error types
  let message = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  }

  // Normalize common backend trap messages
  if (message.includes('Unauthorized: Only users can')) {
    return new Error('[Registration] Please sign in with Internet Identity to continue with registration.');
  }

  if (message.includes('Anonymous')) {
    return new Error('[Registration] Please sign in with Internet Identity before generating OTP.');
  }

  if (message.includes('OTP expired')) {
    return new Error('[Registration] Your OTP has expired. Please generate a new one.');
  }

  if (message.includes('Invalid OTP')) {
    return new Error('[Registration] The OTP you entered is incorrect. Please check and try again.');
  }

  if (message.includes('No OTP found')) {
    return new Error('[Registration] No OTP found for this phone number. Please generate an OTP first.');
  }

  if (message.includes('Actor not initialized')) {
    return new Error('[Registration] Connection not ready. Please sign in and try again.');
  }

  if (message.includes('Too many login attempts')) {
    return new Error('[Registration] Too many attempts. Please wait a few minutes and try again.');
  }

  // Generic backend trap
  if (message.includes('trap') || message.includes('Unauthorized')) {
    return new Error('[Registration] Unable to complete the request. Please ensure you are signed in and try again.');
  }

  // Return wrapped error with prefix
  return new Error(`[Registration] ${message}`);
}
