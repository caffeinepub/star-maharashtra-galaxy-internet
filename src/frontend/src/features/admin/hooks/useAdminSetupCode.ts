import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { storeSessionParameter } from '../../../utils/urlParams';

export function useAdminSetupCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const applyAdminSetupCodeMutation = useMutation({
    mutationFn: async (adminCode: string) => {
      if (!actor) throw new Error('Actor not available');

      // Store the admin token in sessionStorage
      storeSessionParameter('caffeineAdminToken', adminCode);

      // Call the backend to initialize access control with the secret
      // We need to cast the actor to access the internal method
      const actorWithSecret = actor as any;
      if (typeof actorWithSecret._initializeAccessControlWithSecret === 'function') {
        await actorWithSecret._initializeAccessControlWithSecret(adminCode);
      } else {
        throw new Error('Admin initialization method not available');
      }

      return true;
    },
    onSuccess: async () => {
      // Invalidate actor first to force re-initialization with the new token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      
      // Then invalidate and explicitly refetch admin-related queries
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['userRole'] });
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
      
      // Explicitly refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ queryKey: ['isAdmin'] });
      await queryClient.refetchQueries({ queryKey: ['userRole'] });
    },
  });

  return {
    applyAdminSetupCode: applyAdminSetupCodeMutation.mutate,
    isApplying: applyAdminSetupCodeMutation.isPending,
    isSuccess: applyAdminSetupCodeMutation.isSuccess,
    isError: applyAdminSetupCodeMutation.isError,
    error: applyAdminSetupCodeMutation.error,
    reset: applyAdminSetupCodeMutation.reset,
  };
}
