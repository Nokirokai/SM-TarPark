import { useAuth } from '../contexts/AuthContext';

export type UserRole = 'admin' | 'toll' | null;

export function useUserRole() {
  const { user } = useAuth();

  const role: UserRole = user?.role || null;

  return {
    role,
    isAdmin: role === 'admin',
    isToll: role === 'toll',
    hasRole: (requiredRole: UserRole) => role === requiredRole,
  };
}
