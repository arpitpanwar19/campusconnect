import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useOrganizations = () => useQuery({
  queryKey: ['organizations'],
  queryFn: async () => {
    const { data } = await apiClient.get('/organizations');
    return data;
  }
});

export const useOrganization = (slug) => useQuery({
  queryKey: ['organizations', slug],
  queryFn: async () => {
    const { data } = await apiClient.get(`/organizations/${slug}`);
    return data;
  },
  enabled: !!slug
});

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgData) => {
      const { data } = await apiClient.post('/organizations', orgData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] })
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...orgData }) => {
      const { data } = await apiClient.put(`/organizations/${id}`, orgData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] })
  });
};