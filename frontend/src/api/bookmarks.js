import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useMyBookmarks = () => useQuery({
  queryKey: ['bookmarks'],
  queryFn: async () => {
    const { data } = await apiClient.get('/bookmarks');
    return data;
  }
});

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId) => {
      const { data } = await apiClient.post(`/bookmarks/${eventId}/toggle`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  });
};