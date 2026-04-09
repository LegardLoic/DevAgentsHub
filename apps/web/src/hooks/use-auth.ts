'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@devagentshub/types';

import { ApiClientError, apiFetch, postJson } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export const useCurrentUser = () =>
  useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      try {
        const result = await apiFetch<{ user: AuthUser }>('/api/auth/me');
        return result.user;
      } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 401) {
          return null;
        }

        throw error;
      }
    },
    staleTime: 60_000,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postJson<{ success: boolean }, Record<string, never>>('/api/auth/logout', {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

