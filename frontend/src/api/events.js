import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useEvents = (filters) => useQuery({
  queryKey: ['events', filters],
  queryFn: async () => {
    const { data } = await apiClient.get('/events', { params: filters });
    return data;
  }
});

export const useEvent = (slug) => useQuery({
  queryKey: ['events', slug],
  queryFn: async () => {
    const { data } = await apiClient.get(`/events/${slug}`);
    return data;
  },
  enabled: !!slug
});

export const useRecommendedEvents = () => useQuery({
  queryKey: ['events', 'recommended'],
  queryFn: async () => {
    const { data } = await apiClient.get('/events/recommended');
    return data;
  }
});

export const useCalendarEvents = (startDate, endDate) => useQuery({
  queryKey: ['events', 'calendar', startDate, endDate],
  queryFn: async () => {
    const { data } = await apiClient.get('/events/calendar', { params: { start_date: startDate, end_date: endDate } });
    return data;
  },
  enabled: !!startDate && !!endDate
});

export const useEventConflicts = (params) => useQuery({
  queryKey: ['events', 'conflicts', params],
  queryFn: async () => {
    const { data } = await apiClient.get('/events/conflicts', { params });
    return data;
  },
  enabled: !!params?.date && !!params?.startTime
});

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData) => {
      const { data } = await apiClient.post('/events', eventData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: eventData }) => {
      const { data } = await apiClient.put(`/events/${id}`, eventData || {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.post(`/events/${id}/publish`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  });
};

export const useCancelEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.post(`/events/${id}/cancel`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  });
};

export const useEventRegistrations = (eventId) => useQuery({
  queryKey: ['events', eventId, 'registrations'],
  queryFn: async () => {
    const { data } = await apiClient.get(`/events/${eventId}/registrations`);
    return data;
  },
  enabled: !!eventId
});