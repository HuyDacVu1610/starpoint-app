import { Form, Input, Button, App } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  TrophyOutlined,
  SunOutlined,
  MoonOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { setCredentials } from '../features/auth/authSlice';
import { ROUTES } from '../routes/routeConfig';
import { toggleTheme } from '../features/theme/themeSlice';
import type { RootState } from '../store/store';
import { useState, useEffect } from 'react';
import { AuthVisualPanel } from '../components/AuthVisualPanel';

interface LoginValues {
  studentCode: string;
  password: string;
}

export const LoginPage = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.roles.includes('STUDENT')) {
        navigate(ROUTES.STUDENT_ACHIEVEMENTS, { replace: true });
      } else {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      // call api
      const response = await authService.login({
        studentCode: values.studentCode,
        password: values.password,
      });

      if (response.success) {
        message.success('Đăng nhập thành công!');

        // dispatch action
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));

        // redirect based on role
        const roles = response.data.user.roles;
        if (roles.includes('STUDENT')) {
          navigate(ROUTES.STUDENT_ACHIEVEMENTS);
        } else {
          navigate(ROUTES.ADMIN_DASHBOARD);
        }
      } else {
        message.error(response.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Có lỗi xảy ra khi kết nối tới máy chủ.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row select-none overflow-hidden bg-[#f8fafc] dark:bg-[#0a0915] transition-colors duration-300">

      <style>{`
        .ant-form-item-label > label {
          font-size: 10px !important;
          font-weight: 800 !important;
          color: #94a3b8 !important;
          letter-spacing: 0.05em !important;
        }
        .dark .ant-form-item-label > label {
          color: #64748b !important;
        }
        .login-input-custom {
          background-color: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          color: #0f172a !important;
          height: 48px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        .login-input-custom:hover, .login-input-custom:focus {
          border-color: #6366f1 !important;
          background-color: #f8fafc !important;
        }
        .dark .login-input-custom {
          background-color: #191829 !important;
          border: 1px solid #292742 !important;
          color: #ffffff !important;
        }
        .dark .login-input-custom:hover, .dark .login-input-custom:focus {
          border-color: #8b5cf6 !important;
          background-color: #1e1d32 !important;
        }
        .login-input-custom input {
          background: transparent !important;
          color: inherit !important;
        }
        .login-input-custom input::placeholder {
          color: #94a3b8 !important;
        }
        .dark .login-input-custom input::placeholder {
          color: #4b5563 !important;
        }
        .login-submit-btn {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%) !important;
          border: none !important;
          border-radius: 9999px !important;
          height: 48px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
          transition: all 0.3s ease !important;
          color: #ffffff !important;
        }
        .login-submit-btn:hover {
          opacity: 0.95 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45) !important;
        }
      `}</style>

      {/* LEFT COLUMN: Visual Panel */}
      <AuthVisualPanel
        title={<>Chinh phục <span className="text-yellow-300 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 bg-clip-text text-transparent">đỉnh cao</span> học thuật</>}
        subtitle="Ghi nhận thành tích thi đấu, tích lũy điểm thưởng và mở ra cơ hội học bổng xứng đáng với nỗ lực của bạn."
      />

      {/* RIGHT COLUMN: Login Form and Controls */}
      <div className="w-full md:w-[35%] min-h-screen flex flex-col justify-between p-8 sm:p-12 relative bg-[#f8fafc] dark:bg-[#0a0915] transition-colors duration-300">

        {/* Toggle Theme Switch at Top-Right */}
        <div className="absolute top-6 right-6 z-20">
          <Button
            shape="circle"
            icon={isDark ? <SunOutlined className="text-yellow-400 text-base" /> : <MoonOutlined className="text-slate-700 text-base" />}
            onClick={handleToggleTheme}
            className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:scale-105 transition-transform"
          />
        </div>

        {/* Center Content Form */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto space-y-8 py-12 z-10">

          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20">
              <TrophyOutlined />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">StarPointApp</span>
          </div>

          {/* Heading greeting */}
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Chào mừng trở lại</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">Đăng nhập để quản lý điểm thưởng của bạn</p>
          </div>

          {/* Login Form */}
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="studentCode"
              label="TÊN ĐĂNG NHẬP"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                placeholder="VD: N23DCCN094"
                className="login-input-custom"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="MẬT KHẨU"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải dài tối thiểu 6 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                placeholder="••••••••"
                className="login-input-custom"
              />
            </Form.Item>

            {/* Forgot password link */}
            <div className="flex justify-end mb-6">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit button */}
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-submit-btn w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  Đăng nhập <ArrowRightOutlined />
                </span>
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Footer text */}
        <div className="text-center space-y-1.5 z-10">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold select-none">
            Hệ thống dành cho sinh viên & cán bộ
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 select-none font-medium">
            <strong className="text-slate-600 dark:text-slate-300 font-extrabold">Trường Đại học</strong> — Phòng Công tác Sinh viên
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;