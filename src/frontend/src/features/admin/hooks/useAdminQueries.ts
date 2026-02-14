import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import type { Registration } from '../../../backend';

// Check if current user is admin (non-trapping)
export function useCheckIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        const result = await actor.checkIsAdmin();
        return result;
      } catch (error: any) {
        // If the error is "Unauthorized", return false instead of throwing
        if (error?.message?.includes('Unauthorized')) {
          return { isAdmin: false };
        }
        // For other errors, throw to trigger error state
        throw new Error(error?.message || 'Failed to check admin status');
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000,
  });
}

// Get all registrations
export function useGetRegistrations(isAdmin: boolean) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, Registration][]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.getRegistrations();
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to load registrations');
      }
    },
    enabled: !!actor && !actorFetching && isAdmin === true,
    retry: 2,
  });
}

// Delete registration mutation with optimistic update
export function useDeleteCustomerRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.deleteCustomerRegistration(id);
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to delete registration');
      }
    },
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['registrations'] });

      // Snapshot the previous value
      const previousRegistrations = queryClient.getQueryData<[string, Registration][]>(['registrations']);

      // Optimistically update the list (remove the deleted item)
      if (previousRegistrations) {
        queryClient.setQueryData<[string, Registration][]>(
          ['registrations'],
          previousRegistrations.filter(([id]) => id !== deletedId)
        );
      }

      // Return context with the snapshot
      return { previousRegistrations };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      if (context?.previousRegistrations) {
        queryClient.setQueryData(['registrations'], context.previousRegistrations);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}

// Update registration mutation
export function useUpdateCustomerRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      category,
      paymentMethod,
      router,
    }: {
      id: string;
      category: string;
      paymentMethod: string;
      router: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.updateCustomerRegistration(id, category, paymentMethod, router);
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to update registration');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific registration
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration', variables.id] });
    },
  });
}
