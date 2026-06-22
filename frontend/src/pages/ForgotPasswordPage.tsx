import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Steps, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '../services/auth.service';
import { ROUTES } from '../routes/routeConfig';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Keep track of values across steps
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  // Timer for Resend Code
  const [cooldown, setCooldown] = useState(0);
  
  const navigate = useNavigate();

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
      const res = await authService.forgotPassword({
        studentCode: values.studentCode,
        email: values.email,
      });

      if (res.success) {
        message.success('Mã xác nhận đã được gửi!');
        setStudentCode(values.studentCode);
        setEmail(values.email);
        setCurrentStep(1);
        setCooldown(60);
      } else {
        message.error(res.message || 'Yêu cầu thất bại.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Có lỗi xảy ra.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP Code
  const onFinishStep2 = async (values: Step2Values) => {
    setLoading(true);
    try {
      const res = await authService.verifyResetCode({
        studentCode,
        code: values.code,
      });

      if (res.success) {
        message.success('Xác nhận thành công!');
        setCode(values.code);
        setCurrentStep(2);
      } else {
        message.error(res.message || 'Mã xác nhận không đúng.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Có lỗi xảy ra.';
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
        studentCode,
        code,
        newPassword: values.newPassword,
      });

      if (res.success) {
        message.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
        navigate(ROUTES.LOGIN);
      } else {
        message.error(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Có lỗi xảy ra.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 z-10 animate-fade-in">
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to={ROUTES.LOGIN} className="text-slate-400 hover:text-indigo-400 transition-colors">
              <ArrowLeftOutlined style={{ fontSize: '18px' }} />
            </Link>
            <h2 className="text-xl font-bold text-slate-100 m-0">Đặt Lại Mật Khẩu</h2>
          </div>

          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: 'Nhập thông tin' },
              { title: 'Xác thực mã' },
              { title: 'Đặt lại' },
            ]}
            className="mb-8 font-medium steps-custom"
          />

          {/* STEP 1: Form MSSV & Email */}
          {currentStep === 0 && (
            <Form name="step1_form" onFinish={onFinishStep1} layout="vertical" size="large">
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
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email đăng ký!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400" />}
                  placeholder="Nhập email đã đăng ký trong hệ thống"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 font-bold h-11"
                >
                  Gửi mã xác nhận
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* STEP 2: Input Verification Code */}
          {currentStep === 1 && (
            <Form name="step2_form" onFinish={onFinishStep2} layout="vertical" size="large">
              <p className="text-slate-300 text-xs mb-6 text-center leading-relaxed">
                Mã xác nhận 6 số đã được gửi tới email <span className="font-semibold text-indigo-400">{email}</span>. Vui lòng kiểm tra và nhập mã bên dưới:
              </p>

              <Form.Item
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                  { len: 6, message: 'Mã xác nhận phải gồm đúng 6 số!' }
                ]}
              >
                <Input
                  prefix={<KeyOutlined className="text-slate-400" />}
                  placeholder="Mã xác nhận 6 chữ số"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500 tracking-[0.2em] text-center font-bold"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Button 
                  type="link" 
                  onClick={() => setCurrentStep(0)} 
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors p-0"
                >
                  Quay lại bước 1
                </Button>
                <Button
                  type="link"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors p-0"
                >
                  {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
                </Button>
              </div>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 font-bold h-11"
                >
                  Xác thực mã
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* STEP 3: Reset Password */}
          {currentStep === 2 && (
            <Form name="step3_form" onFinish={onFinishStep3} layout="vertical" size="large">
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu mới phải dài tối thiểu 6 ký tự!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Nhập mật khẩu mới"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
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
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Xác nhận mật khẩu mới"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-indigo-500 focus:border-indigo-500"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 font-bold h-11"
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
