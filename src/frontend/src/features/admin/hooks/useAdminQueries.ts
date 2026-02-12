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

  // Claim admin access (triggers re-initialization of actor with admin token)
  // The actual admin assignment happens in useActor.ts via _initializeAccessControlWithSecret
  const claimAdminMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Simply trigger a refresh - the admin initialization happens automatically
      // in useActor.ts when the actor is created with the caffeineAdminToken
      return true;
    },
    onSuccess: () => {
      // Invalidate admin status and user role queries to trigger refresh
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

  // Fetch single registration by ID (admin only)
  const useRegistrationQuery = (id: string | null) => {
    return useQuery<Registration>({
      queryKey: ['registration', id],
      queryFn: async () => {
        if (!actor || !id) throw new Error('Actor or ID not available');
        return await actor.getRegistration(id);
      },
      enabled: !!actor && !actorFetching && !!id && isAdminQuery.data === true,
      retry: false,
    });
  };

  return {
    isAdminQuery,
    userRoleQuery,
    claimAdminMutation,
    registrationsQuery,
    useRegistrationQuery,
  };
}
