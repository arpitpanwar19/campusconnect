import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useNotifications = () => useQuery({
  queryKey: ['notifications'],
  queryFn: async () => {
    const { data } = await apiClient.get('/notifications');
    return data;
  }
});

export const useUnreadCount = () => useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  }
});

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.put(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.put('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};