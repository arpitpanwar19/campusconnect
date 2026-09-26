import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const usePendingOrgs = () => useQuery({
  queryKey: ['admin', 'organizations', 'pending'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin/organizations/pending');
    return data;
  }
});

export const useVerifyOrg = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.put(`/admin/organizations/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] })
  });
};

export const useAdminEvents = () => useQuery({
  queryKey: ['admin', 'events'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin/events');
    return data;
  }
});

export const useAdminUsers = () => useQuery({
  queryKey: ['admin', 'users'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin/users');
    return data;
  }
});

export const useAuditLogs = () => useQuery({
  queryKey: ['admin', 'audit-logs'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin/audit-logs');
    return data;
  }
});

export const useAdminStats = () => useQuery({
  queryKey: ['admin', 'stats'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin/stats');
    return data;
  }
});

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }) => {
      const { data } = await apiClient.put(`/admin/users/${id}/role`, { role });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  });
};

export const useDisableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.put(`/admin/events/${id}/disable`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
  });
};