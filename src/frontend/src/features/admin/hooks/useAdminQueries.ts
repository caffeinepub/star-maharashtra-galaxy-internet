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

  // Fetch single registration with receipt info (admin only) - with resilient error handling
  const useRegistrationWithReceiptQuery = (id: string | null) => {
    return useQuery<{ registration: Registration | null; hasReceipt: boolean; error?: string }>({
      queryKey: ['registration', id, 'withReceipt'],
      queryFn: async () => {
        if (!actor || !id) throw new Error('Actor or ID not available');
        
        try {
          // Try the primary method first
          const [registration, hasReceipt] = await actor.getRegistrationWithReceiptInfo(id);
          return { registration, hasReceipt };
        } catch (primaryError) {
          // If primary method fails, try fallback: fetch basic registration
          try {
            const registration = await actor.getRegistration(id);
            if (registration) {
              // Try to check receipt separately
              try {
                const hasReceipt = await actor.hasReceipt(id);
                return { 
                  registration, 
                  hasReceipt,
                  error: 'Some fields may be unavailable due to legacy data format'
                };
              } catch {
                // If receipt check fails, assume no receipt
                return { 
                  registration, 
                  hasReceipt: false,
                  error: 'Some fields may be unavailable due to legacy data format'
                };
              }
            } else {
              throw new Error('Registration not found');
            }
          } catch (fallbackError) {
            // If all methods fail, throw the original error
            throw primaryError;
          }
        }
      },
      enabled: !!actor && !actorFetching && !!id && isAdminQuery.data === true,
      retry: 1, // Retry once on failure
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

  // Delete customer registration mutation
  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteCustomerRegistration(id);
      } catch (error: unknown) {
        // Normalize backend errors into readable Error messages
        if (error instanceof Error) {
          throw error;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          throw new Error(String((error as { message: unknown }).message));
        } else if (typeof error === 'string') {
          throw new Error(error);
        } else {
          throw new Error('Failed to delete registration');
        }
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidate registrations list to refresh the list view
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      // Invalidate the specific registration detail query
      queryClient.invalidateQueries({ queryKey: ['registration', deletedId, 'withReceipt'] });
    },
  });

  return {
    isAdminQuery,
    userRoleQuery,
    claimAdminMutation,
    registrationsQuery,
    useRegistrationWithReceiptQuery,
    updateRegistrationMutation,
    deleteRegistrationMutation,
  };
}
