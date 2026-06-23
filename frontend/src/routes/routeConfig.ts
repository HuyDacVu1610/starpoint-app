export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin & Staff Paths
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENT_DETAIL: '/admin/students/:id',
  ADMIN_SEMESTERS: '/admin/semesters',
  ADMIN_COMPETITIONS: '/admin/competitions',
  ADMIN_ACHIEVEMENTS: '/admin/achievements',
  ADMIN_BONUS_POINTS: '/admin/bonus-points',
  ADMIN_SCHOLARSHIPS: '/admin/scholarships',

  // Student Paths
  STUDENT_DASHBOARD: '/student',
  STUDENT_ACHIEVEMENTS: '/student/achievements',
  STUDENT_BONUS_POINTS: '/student/bonus-points',
  STUDENT_SCHOLARSHIP: '/student/scholarship',
};
export type RoutesType = typeof ROUTES;
