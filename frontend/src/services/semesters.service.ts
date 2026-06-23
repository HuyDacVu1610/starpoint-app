import { api } from './api';

export interface Semester {
  id: number;
  name: string;
  year: number;
  term: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export const semestersService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get('/semesters', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get(`/semesters/${id}`);
    return res.data;
  },

  create: async (data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await api.post('/semesters', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const res = await api.patch(`/semesters/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/semesters/${id}`);
    return res.data;
  },
};
