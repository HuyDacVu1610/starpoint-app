import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROUTES } from './routeConfig';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

// Admin / Staff Pages
import DashboardPage from '../pages/DashboardPage';
import StudentListPage from '../pages/students/StudentListPage';
import SemesterListPage from '../pages/semesters/SemesterListPage';
import CompetitionListPage from '../pages/competitions/CompetitionListPage';
import AchievementListPage from '../pages/achievements/AchievementListPage';
import BonusPointListPage from '../pages/bonus-points/BonusPointListPage';
import ScholarshipListPage from '../pages/scholarships/ScholarshipListPage';

// Student Pages
import MyAchievementsPage from '../pages/student/MyAchievementsPage';
import MyBonusPointPage from '../pages/student/MyBonusPointPage';
import MyScholarshipPage from '../pages/student/MyScholarshipPage';

import { useAuth } from '../hooks/useAuth';

export const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();

  // Root path redirect based on authentication and roles
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
    if (user.roles.includes('STUDENT')) {
      return <Navigate to={ROUTES.STUDENT_ACHIEVEMENTS} replace />;
    }
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Admin / Staff Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['ADMIN', 'STAFF']} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.ADMIN_STUDENTS} element={<StudentListPage />} />
            <Route path={ROUTES.ADMIN_SEMESTERS} element={<SemesterListPage />} />
            <Route path={ROUTES.ADMIN_COMPETITIONS} element={<CompetitionListPage />} />
            <Route path={ROUTES.ADMIN_ACHIEVEMENTS} element={<AchievementListPage />} />
            <Route path={ROUTES.ADMIN_BONUS_POINTS} element={<BonusPointListPage />} />
            <Route path={ROUTES.ADMIN_SCHOLARSHIPS} element={<ScholarshipListPage />} />
          </Route>
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path={ROUTES.STUDENT_DASHBOARD} element={<Navigate to={ROUTES.STUDENT_ACHIEVEMENTS} replace />} />
            <Route path={ROUTES.STUDENT_ACHIEVEMENTS} element={<MyAchievementsPage />} />
            <Route path={ROUTES.STUDENT_BONUS_POINTS} element={<MyBonusPointPage />} />
            <Route path={ROUTES.STUDENT_SCHOLARSHIP} element={<MyScholarshipPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={getRootRedirect()} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRouter;
