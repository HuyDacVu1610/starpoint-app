import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { setCredentials } from '../features/auth/authSlice';
import { ROUTES } from '../routes/routeConfig';
import { useState, useEffect } from 'react';

interface LoginValues {
  studentCode: string;
  password: string;
}

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <TrophyOutlined style={{ fontSize: '26px' }} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white select-none">
            StarPoint<span className="text-indigo-400">App</span>
          </h1>
          <p className="text-slate-400 text-xs select-none">
            Hệ thống Quản lý Điểm thưởng & Xét Học bổng Khuyến khích Học tập
          </p>
        </div>

        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 sm:p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-center select-none">
            Đăng Nhập Tài Khoản
          </h2>

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="studentCode"
              rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên/mã người dùng!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-slate-400" />} 
                placeholder="Nhập mã số sinh viên (MSSV)" 
                className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải dài tối thiểu 6 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Mật khẩu"
                className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500"
              />
            </Form.Item>

            <div className="flex justify-end items-center mb-6">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 font-bold h-11"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
export default LoginPage;
