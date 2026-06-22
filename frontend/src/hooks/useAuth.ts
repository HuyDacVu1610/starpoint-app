import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout as logoutAction } from '../features/auth/authSlice';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      // ADMIN role has all permissions
      if (user.roles.includes('ADMIN')) return true;
      return user.permissions.includes(permission);
    },
    [user],
  );

  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user],
  );

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    logout,
    hasPermission,
    hasRole,
  };
};
export type UseAuthType = ReturnType<typeof useAuth>;
