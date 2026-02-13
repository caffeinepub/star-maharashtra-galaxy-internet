import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { storeSessionParameter } from '../../../utils/urlParams';

/**
 * Normalize setup code errors into user-friendly messages
 */
function normalizeSetupCodeError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Failed to apply setup code. Please try again.');
  }

  const message = error.message.toLowerCase();

  // Actor not available
  if (message.includes('not available') || message.includes('actor')) {
    return new Error('Backend not available. Please sign in with Internet Identity first, then try again.');
  }

  // Rate limiting
  if (message.includes('too many')) {
    return new Error('Too many attempts. Please wait a few minutes and try again.');
  }

  // Invalid code
  if (message.includes('invalid') || message.includes('unauthorized')) {
    return new Error('Invalid setup code. Please check the code and try again.');
  }

  // Generic fallback
  return new Error('Failed to apply setup code. Please try again or contact support if the issue persists.');
}

export function useAdminSetupCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (setupCode: string) => {
      if (!actor) {
        throw new Error('Backend actor not available. Please sign in with Internet Identity first.');
      }

      try {
        // Store the setup code in sessionStorage as caffeineAdminToken
        storeSessionParameter('caffeineAdminToken', setupCode);

        // Invalidate the actor query to trigger re-initialization with the new token
        await queryClient.invalidateQueries({ queryKey: ['actor'] });
        
        // Wait for actor to re-initialize
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Aggressively invalidate and refetch all admin-related queries
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        await queryClient.invalidateQueries({ queryKey: ['userRole'] });
        await queryClient.invalidateQueries({ queryKey: ['registrations'] });
        
        // Force immediate refetch
        await queryClient.refetchQueries({ queryKey: ['isAdmin'] });
        await queryClient.refetchQueries({ queryKey: ['userRole'] });
      } catch (error) {
        throw normalizeSetupCodeError(error);
      }
    },
    onError: (error) => {
      console.error('Failed to apply admin setup code:', error);
    },
  });

  return {
    applyAdminSetupCode: mutation.mutateAsync,
    isApplying: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
