import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { storeSessionParameter } from '../../../utils/urlParams';

export function useAdminSetupCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (setupCode: string) => {
      if (!actor) {
        throw new Error('Backend actor not available');
      }

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
