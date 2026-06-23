import { api } from './api';

export const dashboardService = {
  getStats: async (semesterId?: number) => {
    const res = await api.get('/dashboard/stats', {
      params: semesterId ? { semesterId } : undefined,
    });
    return res.data;
  },

  getCharts: async (semesterId?: number) => {
    const res = await api.get('/dashboard/charts', {
      params: semesterId ? { semesterId } : undefined,
    });
    return res.data;
  },
};

export default dashboardService;
