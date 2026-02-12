import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';

interface AdminLoginParams {
  username: string;
  password: string;
}

/**
 * Normalize backend errors into user-friendly messages
 */
function normalizeLoginError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Login failed. Please try again.');
  }

  const message = error.message.toLowerCase();

  // Map backend-internal authorization errors to user-friendly messages
  if (message.includes('assign user roles') || message.includes('unauthorized')) {
    // This is likely a backend-internal authorization error leaking through
    // Treat it as invalid credentials
    return new Error('Invalid username or password. Please check your credentials and try again.');
  }

  // Anonymous user error
  if (message.includes('anonymous')) {
    return new Error('Please sign in with Internet Identity first, then try logging in again.');
  }

  // Rate limiting
  if (message.includes('too many')) {
    return new Error('Too many login attempts. Please wait a few minutes and try again.');
  }

  // Invalid credentials (explicit)
  if (message.includes('invalid') || message.includes('credentials')) {
    return new Error('Invalid username or password. Please check your credentials and try again.');
  }

  // Generic fallback
  return new Error('Login failed. Please try again or contact support if the issue persists.');
}

export function useAdminPasswordLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }: AdminLoginParams) => {
      if (!actor) {
        throw new Error('Please sign in with Internet Identity first, then try logging in again.');
      }

      try {
        // Call backend to validate credentials and grant admin role
        // The backend returns void after successfully granting admin access
        await actor.loginAdmin(username, password);
      } catch (error) {
        // Normalize the error before throwing
        throw normalizeLoginError(error);
      }
    },
    onSuccess: async () => {
      // Wait for actor to re-initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate all admin-related queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['userRole'] });
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
      
      // Refetch to ensure immediate UI update
      await queryClient.refetchQueries({ queryKey: ['isAdmin'] });
      await queryClient.refetchQueries({ queryKey: ['userRole'] });
    },
    onError: (error) => {
      console.error('Admin login failed:', error);
    },
  });
}
