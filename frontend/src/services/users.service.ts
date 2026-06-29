import { api } from './api';

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserRoleRelation {
  roleId: number;
  userId: number;
  role: Role;
}

export interface User {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRoleRelation[];
}

export const usersService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'userRoles'> & { roleIds: number[]; password?: string }) => {
    const res = await api.post('/users', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'userRoles'>> & { roleIds?: number[]; password?: string }) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  listRoles: async () => {
    const res = await api.get('/roles');
    return res.data;
  },

  import: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
