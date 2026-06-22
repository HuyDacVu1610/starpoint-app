import { api } from './api';
import type { ApiResponse } from '@starpointapp/shared';

export interface LoginPayload {
  studentCode: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    studentCode: string;
    fullName: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  studentCode: string;
  email: string;
}

export interface VerifyResetCodePayload {
  studentCode: string;
  code: string;
}

export interface ResetPasswordPayload {
  studentCode: string;
  code: string;
  newPassword: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    return res.data;
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await api.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },

  async getMe(): Promise<ApiResponse<LoginResponseData['user']>> {
    const res = await api.get<ApiResponse<LoginResponseData['user']>>('/auth/me');
    return res.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<void>> {
    const res = await api.patch<ApiResponse<void>>('/auth/change-password', payload);
    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<void>> {
    const res = await api.post<ApiResponse<void>>('/auth/forgot-password', payload);
    return res.data;
  },

  async verifyResetCode(payload: VerifyResetCodePayload): Promise<ApiResponse<void>> {
    const res = await api.post<ApiResponse<void>>('/auth/verify-reset-code', payload);
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<void>> {
    const res = await api.post<ApiResponse<void>>('/auth/reset-password', payload);
    return res.data;
  },
};
