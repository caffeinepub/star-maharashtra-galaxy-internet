import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import type { Registration, UserRole } from '../../../backend';

export function useAdminQueries() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Check if the current user is admin
  const isAdminQuery = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Get caller's user role
  const userRoleQuery = useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Claim admin access
  const claimAdminMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });

  // Fetch all registrations (admin only)
  const registrationsQuery = useQuery<Array<[string, Registration]>>({
    queryKey: ['registrations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getRegistrations();
    },
    enabled: !!actor && !actorFetching && isAdminQuery.data === true,
    retry: false,
  });

  // Fetch single registration with receipt info (admin only)
  const useRegistrationWithReceiptQuery = (id: string | null) => {
    return useQuery<[Registration, boolean]>({
      queryKey: ['registration', id, 'withReceipt'],
      queryFn: async () => {
        if (!actor || !id) throw new Error('Actor or ID not available');
        return await actor.getRegistrationWithReceiptInfo(id);
      },
      enabled: !!actor && !actorFetching && !!id && isAdminQuery.data === true,
      retry: false,
      staleTime: 0, // Always fetch fresh data when selection changes
    });
  };

  // Update customer registration mutation
  const updateRegistrationMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      category,
      paymentMethod,
      router,
    }: {
      id: string;
      name: string;
      category: string;
      paymentMethod: string;
      router: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCustomerRegistration(id, name, category, paymentMethod, router);
    },
    onSuccess: (_, variables) => {
      // Invalidate registrations list to refresh the list view
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      // Invalidate the specific registration detail to refresh the detail view
      queryClient.invalidateQueries({ queryKey: ['registration', variables.id, 'withReceipt'] });
    },
  });

  return {
    isAdminQuery,
    userRoleQuery,
    claimAdminMutation,
    registrationsQuery,
    useRegistrationWithReceiptQuery,
    updateRegistrationMutation,
  };
}
