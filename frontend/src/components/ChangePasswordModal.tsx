import { useState } from 'react';
import { Modal, Form, Input, App } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';

interface ChangePasswordModalProps {
  open: boolean;
  onCancel: () => void;
}

export const ChangePasswordModal = ({ open, onCancel }: ChangePasswordModalProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const res = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (res.success) {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields();
        onCancel();
      } else {
        message.error(res.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      // If validation fails on the frontend, validateFields throws without response
      if (err.errorFields) {
        return;
      }
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-100 font-extrabold text-base">
          <KeyOutlined className="text-indigo-500" />
          <span>Đổi Mật Khẩu Tài Khoản</span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Cập nhật"
      cancelText="Huỷ"
      okButtonProps={{ 
        className: 'bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm font-semibold',
        loading 
      }}
      cancelButtonProps={{
        className: 'rounded-lg hover:border-slate-300'
      }}
      destroyOnClose
      width={400}
    >
      <div className="mt-4">
        <Form form={form} layout="vertical" disabled={loading}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Nhập mật khẩu đang sử dụng" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
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
              placeholder="Nhập lại mật khẩu mới để xác nhận" 
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
