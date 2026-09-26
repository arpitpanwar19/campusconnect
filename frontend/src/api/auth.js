import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/authStore';

export const useSyncUser = () => useMutation({
  mutationFn: async (userData) => {
    const { data } = await apiClient.post('/auth/signup', userData);
    return data;
  }
});

export const useOnboarding = () => {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (onboardingData) => {
      const { data } = await apiClient.post('/auth/onboarding', onboardingData);
      return data;
    },
    onSuccess: (data) => setUser(data.user)
  });
};

export const useProfile = () => useQuery({
  queryKey: ['auth', 'me'],
  queryFn: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  }
});

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await apiClient.put('/auth/me', profileData);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });
};