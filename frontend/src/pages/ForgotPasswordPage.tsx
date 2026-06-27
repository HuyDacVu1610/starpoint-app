import { useState, useEffect } from 'react';
import { Form, Input, Button, Steps, App } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  SunOutlined,
  MoonOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '../services/auth.service';
import { ROUTES } from '../routes/routeConfig';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../features/theme/themeSlice';
import type { RootState } from '../store/store';
import { AuthVisualPanel } from '../components/AuthVisualPanel';

interface Step1Values {
  studentCode: string;
  email: string;
}

interface Step2Values {
  code: string;
}

interface Step3Values {
  newPassword: string;
}

export const ForgotPasswordPage = () => {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Keep track of values across steps
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Timer for Resend Code
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      await authService.forgotPassword({ studentCode, email });
      message.success('Mã xác nhận mới đã được gửi tới email của bạn.');
      setCooldown(60);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Không thể gửi lại mã.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit MSSV & Email
  const onFinishStep1 = async (values: Step1Values) => {
    setLoading(true);
    try {
      const trimmedStudentCode = values.studentCode.trim().toUpperCase();
      const trimmedEmail = values.email.trim();
      const res = await authService.forgotPassword({
        studentCode: trimmedStudentCode,
        email: trimmedEmail,
      });

      if (res.success) {
        message.success('Mã xác nhận đã được gửi!');
        setStudentCode(trimmedStudentCode);
        setEmail(trimmedEmail);
        setCurrentStep(1);
        setCooldown(60);
      } else {
        message.error(res.message || 'Yêu cầu thất bại.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: string[] }>;
      const errors = axiosError.response?.data?.errors;
      const errorMsg = (errors && errors.length > 0)
        ? errors[0]
        : (axiosError.response?.data?.message || 'Có lỗi xảy ra.');
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP Code
  const onFinishStep2 = async (values: Step2Values) => {
    setLoading(true);
    try {
      const trimmedCode = values.code.trim();
      const res = await authService.verifyResetCode({
        studentCode: studentCode.trim().toUpperCase(),
        code: trimmedCode,
      });

      if (res.success) {
        message.success('Xác nhận thành công!');
        setCode(trimmedCode);
        setCurrentStep(2);
      } else {
        message.error(res.message || 'Mã xác nhận không đúng.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: string[] }>;
      const errors = axiosError.response?.data?.errors;
      const errorMsg = (errors && errors.length > 0)
        ? errors[0]
        : (axiosError.response?.data?.message || 'Có lỗi xảy ra.');
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit New Password
  const onFinishStep3 = async (values: Step3Values) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        studentCode: studentCode.trim().toUpperCase(),
        code: code.trim(),
        newPassword: values.newPassword,
      });

      if (res.success) {
        message.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
        navigate(ROUTES.LOGIN);
      } else {
        message.error(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: string[] }>;
      const errors = axiosError.response?.data?.errors;
      const errorMsg = (errors && errors.length > 0)
        ? errors[0]
        : (axiosError.response?.data?.message || 'Có lỗi xảy ra.');
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
        /* Custom steps design overrides */
        .steps-custom .ant-steps-item-title {
          font-size: 11px !important;
          font-weight: 700 !important;
        }
        .dark .steps-custom .ant-steps-item-title {
          color: #94a3b8 !important;
        }
      `}</style>

      {/* LEFT COLUMN: Visual Panel */}
      <AuthVisualPanel
        title={<>Khôi phục <span className="text-[#2dd4bf] bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] bg-clip-text text-transparent">tài khoản</span> của bạn</>}
        subtitle="Chỉ cần mã số sinh viên và email đã đăng ký, bạn sẽ lấy lại quyền truy cập trong vài bước đơn giản."
      />

      {/* RIGHT COLUMN: Forgot Password Form */}
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
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto space-y-6 py-12 z-10">

          {/* Back link */}
          <Link to={ROUTES.LOGIN} className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold mb-4">
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>

          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20">
              <KeyOutlined />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">Đặt Lại Mật Khẩu</span>
          </div>

          {/* Heading greeting */}
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentStep === 0 && 'Xác minh danh tính'}
              {currentStep === 1 && 'Xác thực mã OTP'}
              {currentStep === 2 && 'Thiết lập mật khẩu'}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">
              {currentStep === 0 && 'Nhập MSSV và email đã đăng ký trong hệ thống'}
              {currentStep === 1 && 'Nhập mã xác thực đã nhận được trong email'}
              {currentStep === 2 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>

          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: 'Nhập thông tin' },
              { title: 'Xác thực mã' },
              { title: 'Đặt lại' },
            ]}
            className="mb-4 font-medium steps-custom"
          />

          {/* STEP 1: Form MSSV & Email */}
          {currentStep === 0 && (
            <Form name="step1_form" onFinish={onFinishStep1} layout="vertical" size="large">
              <Form.Item
                name="studentCode"
                label="MÃ SỐ SINH VIÊN (MSSV)"
                rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên/mã người dùng!' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                  placeholder="VD: N23DCCN094"
                  className="login-input-custom"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="EMAIL ĐÃ ĐĂNG KÝ"
                rules={[
                  { required: true, message: 'Vui lòng nhập email đăng ký!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                  placeholder="vd: sv@ptithcm.edu.vn"
                  className="login-input-custom"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-submit-btn w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    Gửi mã xác nhận <ArrowRightOutlined />
                  </span>
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* STEP 2: Input Verification Code */}
          {currentStep === 1 && (
            <Form name="step2_form" onFinish={onFinishStep2} layout="vertical" size="large">
              <p className="text-slate-550 dark:text-slate-400 text-xs mb-6 text-center leading-relaxed">
                Mã xác nhận 6 số đã được gửi tới email <span className="font-semibold text-indigo-500">{email}</span>. Vui lòng kiểm tra và nhập mã bên dưới:
              </p>

              <Form.Item
                name="code"
                label="MÃ XÁC NHẬN (OTP)"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                  { len: 6, message: 'Mã xác nhận phải gồm đúng 6 số!' }
                ]}
              >
                <Input
                  prefix={<KeyOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                  placeholder="Mã xác nhận 6 chữ số"
                  className="login-input-custom tracking-[0.2em] text-center font-bold"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-0"
                >
                  Quay lại bước 1
                </Button>
                <Button
                  type="link"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors p-0 font-bold"
                >
                  {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
                </Button>
              </div>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-submit-btn w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    Xác thực mã <ArrowRightOutlined />
                  </span>
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* STEP 3: Reset Password */}
          {currentStep === 2 && (
            <Form name="step3_form" onFinish={onFinishStep3} layout="vertical" size="large">
              <Form.Item
                name="newPassword"
                label="MẬT KHẨU MỚI"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu mới phải dài tối thiểu 6 ký tự!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                  placeholder="Nhập mật khẩu mới"
                  className="login-input-custom"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="XÁC NHẬN MẬT KHẨU MỚI"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 dark:text-slate-600 mr-1.5" />}
                  placeholder="Xác nhận mật khẩu mới"
                  className="login-input-custom"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-submit-btn w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    Đặt lại mật khẩu <ArrowRightOutlined />
                  </span>
                </Button>
              </Form.Item>
            </Form>
          )}
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

export default ForgotPasswordPage;
