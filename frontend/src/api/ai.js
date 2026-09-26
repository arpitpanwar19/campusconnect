import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useAICopilot = () => useMutation({
  mutationFn: async (content) => {
    const { data } = await apiClient.post('/ai/copilot', { content });
    return data;
  }
});

export const useNaturalSearch = () => useMutation({
  mutationFn: async (query) => {
    const { data } = await apiClient.post('/search/natural', { query });
    return data;
  }
});

export const useWeeklyDigest = () => useMutation({
  mutationFn: async () => {
    const { data } = await apiClient.post('/ai/digest');
    return data;
  }
});