import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Tooltip,
  Tag,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { usersService } from '../../services/users.service';
import type { User, Role } from '../../services/users.service';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';

const { Option } = Select;

const ROLE_COLOR_MAP: Record<string, string> = {
  ADMIN: 'red',
  STAFF: 'orange',
  STUDENT: 'blue',
};

const ROLE_LABEL_MAP: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Giáo vụ',
  STUDENT: 'Sinh viên',
};

export const StudentListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  // Action Permissions
  const canCreate = hasPermission('CREATE_USER');
  const canUpdate = hasPermission('UPDATE_USER');
  const canDelete = hasPermission('DELETE_USER');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersService.list({
        search: search || undefined,
        limit: 100,
      });
      if (res.success && res.data) {
        const userList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(userList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách người dùng');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await usersService.listRoles();
      if (res.success && res.data) {
        setRoles(res.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search]);

  const handleOpenAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue({
      studentCode: record.studentCode,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      roleId: record.userRoles?.[0]?.roleId || undefined,
      password: '', // Kept empty for edit
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      const res = await usersService.delete(id);
      if (res.success) {
        message.success('Xoá tài khoản thành công');
        fetchUsers();
      } else {
        message.error(res.message || 'Không thể xoá tài khoản');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi xảy ra khi xoá tài khoản');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const payload: any = {
        studentCode: values.studentCode,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        roleIds: [values.roleId],
      };

      if (values.password) {
        payload.password = values.password;
      }

      let res;
      if (editingId) {
        res = await usersService.update(editingId, payload);
      } else {
        res = await usersService.create(payload);
      }

      if (res.success) {
        message.success(editingId ? 'Cập nhật tài khoản thành công' : 'Thêm tài khoản thành công');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        message.error(res.message || 'Đã có lỗi xảy ra');
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData) {
        if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          message.error(responseData.errors.join(', '));
        } else if (responseData.message) {
          message.error(responseData.message);
        } else {
          message.error('Đã có lỗi xảy ra');
        }
      } else {
        message.error(err.message || 'Không thể kết nối đến máy chủ');
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      message.error('Vui lòng chọn một file Excel');
      return;
    }

    setImporting(true);
    try {
      const res = await usersService.import(importFile);
      if (res.success) {
        message.success(res.message || 'Nhập danh sách người dùng thành công');
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchUsers();
      } else {
        message.error(res.message || 'Đã xảy ra lỗi khi nhập danh sách');
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData) {
        if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          Modal.error({
            title: 'Lỗi Nhập Dữ Liệu Excel',
            content: (
              <div className="max-h-60 overflow-y-auto mt-2">
                <ul className="list-disc pl-4 space-y-1">
                  {responseData.errors.map((e: string, i: number) => (
                    <li key={i} className="text-red-600 text-xs">{e}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 500,
          });
        } else if (responseData.message) {
          message.error(responseData.message);
        } else {
          message.error('Đã có lỗi xảy ra');
        }
      } else {
        message.error(err.message || 'Không thể kết nối đến máy chủ');
      }
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    {
      title: 'Mã Người Dùng',
      dataIndex: 'studentCode',
      key: 'studentCode',
      className: 'font-semibold text-slate-700',
      render: (code: string, record: User) => (
        <Link to={`/admin/students/${record.id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors font-mono">
          {code}
        </Link>
      ),
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text?: string) => text || 'Chưa cập nhật',
    },
    {
      title: 'Vai Trò',
      key: 'roles',
      render: (_: any, record: User) => (
        <Space size={[0, 4]} wrap>
          {record.userRoles?.map((ur) => {
            const roleName = ur.role.name;
            return (
              <Tag color={ROLE_COLOR_MAP[roleName] || 'default'} key={roleName} className="font-semibold uppercase">
                {ROLE_LABEL_MAP[roleName] || roleName}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    // Future-Proof columns for calculated GPA, conduct, bonus points and scholarship candidates
    {
      title: 'GPA',
      key: 'gpa',
      width: 100,
      render: (_: any, record: User) => {
        const scores = (record as any).semesterScores;
        if (scores && scores.length > 0 && scores[0].gpa !== null && scores[0].gpa !== undefined) {
          return <span className="font-semibold text-slate-700">{scores[0].gpa.toFixed(2)}</span>;
        }
        const isStudent = record.userRoles?.some((ur) => ur.role.name === 'STUDENT');
        return isStudent ? <span className="text-slate-400 font-medium text-xs">Chưa nhập</span> : <span className="text-slate-300">-</span>;
      },
    },
    {
      title: 'ĐRL',
      key: 'conductScore',
      width: 100,
      render: (_: any, record: User) => {
        const scores = (record as any).semesterScores;
        if (scores && scores.length > 0 && scores[0].conductScore !== null && scores[0].conductScore !== undefined) {
          return <span className="font-semibold text-slate-700">{scores[0].conductScore}</span>;
        }
        const isStudent = record.userRoles?.some((ur) => ur.role.name === 'STUDENT');
        return isStudent ? <span className="text-slate-400 font-medium text-xs">Chưa nhập</span> : <span className="text-slate-300">-</span>;
      },
    },
    {
      title: 'Điểm Thưởng',
      key: 'bonusPoints',
      width: 120,
      render: (_: any, record: User) => {
        const scores = (record as any).semesterScores;
        if (scores && scores.length > 0) {
          return <span className="font-semibold text-emerald-600">+{scores[0].maxBonusPoint?.toFixed(2)}</span>;
        }
        const isStudent = record.userRoles?.some((ur) => ur.role.name === 'STUDENT');
        return isStudent ? <span className="text-slate-400 font-medium text-xs">Chưa nhập</span> : <span className="text-slate-300">-</span>;
      },
    },
    {
      title: 'Học Bổng',
      key: 'scholarship',
      width: 120,
      render: (_: any, record: User) => {
        const candidates = (record as any).scholarshipCandidates;
        if (candidates && candidates.length > 0) {
          const activeTier = candidates[0].scholarshipTier;
          const isEligible = candidates[0].isEligible;
          if (!isEligible) return <Tag color="default">Không đạt</Tag>;
          
          let color = 'blue';
          let text = 'Khá';
          if (activeTier === 'EXCELLENT') { color = 'gold'; text = 'Xuất Sắc'; }
          else if (activeTier === 'GOOD') { color = 'purple'; text = 'Giỏi'; }
          
          return <Tag color={color} className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded-full">{text}</Tag>;
        }
        const isStudent = record.userRoles?.some((ur) => ur.role.name === 'STUDENT');
        return isStudent ? <span className="text-slate-400 font-medium text-xs">Chưa xét</span> : <span className="text-slate-300">-</span>;
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title={canUpdate ? 'Chỉnh sửa tài khoản' : 'Bạn không có quyền thực hiện hành động này'}>
            <Button
              type="text"
              icon={<EditOutlined className={canUpdate ? 'text-blue-500 hover:scale-110 transition-transform' : 'text-slate-300'} />}
              onClick={() => canUpdate && handleOpenEdit(record)}
              disabled={!canUpdate}
            />
          </Tooltip>

          <Tooltip title={canDelete ? 'Xoá tài khoản' : 'Bạn không có quyền thực hiện hành động này'}>
            <span>
              <Popconfirm
                title="Xác nhận xoá tài khoản này?"
                onConfirm={() => handleConfirmDelete(record.id)}
                okText="Xoá"
                cancelText="Huỷ"
                okButtonProps={{ danger: true }}
                disabled={!canDelete}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined className={canDelete ? 'hover:scale-110 transition-transform' : 'text-slate-300'} />}
                  disabled={!canDelete}
                />
              </Popconfirm>
            </span>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Người Dùng & Sinh Viên"
        subtitle="Quản lý tài khoản, mã sinh viên, thông tin lớp và vai trò phân quyền"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Người dùng' }]}
        extra={
          <Space>
            {canCreate && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsImportModalOpen(true)}
                className="rounded-lg shadow-sm border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600"
              >
                Nhập từ Excel
              </Button>
            )}
            <Tooltip title={canCreate ? 'Thêm tài khoản người dùng mới' : 'Bạn không có quyền thực hiện hành động này'}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                disabled={!canCreate}
                className={`border-none rounded-lg shadow-sm ${
                  canCreate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-200 text-slate-400'
                }`}
              >
                Thêm Người Dùng
              </Button>
            </Tooltip>
          </Space>
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md overflow-hidden">
        <div className="mb-6 max-w-sm">
          <Input
            placeholder="Tìm theo Mã số, Họ tên, Email..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="rounded-lg"
          />
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản Mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ bỏ"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="studentCode"
              label="Mã Người Dùng / MSSV"
              rules={[
                { required: true, message: 'Vui lòng nhập mã sinh viên/người dùng' },
                { pattern: /^[A-Z0-9_-]+$/i, message: 'Mã chỉ được chứa chữ cái, số, gạch ngang' },
              ]}
            >
              <Input placeholder="Ví dụ: SV006, STAFF002..." prefix={<UserOutlined />} disabled={editingId !== null} />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Địa Chỉ Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Địa chỉ email không hợp lệ' },
              ]}
            >
              <Input placeholder="nhap@email.com" prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số Điện Thoại (Tuỳ chọn)"
            >
              <Input placeholder="Ví dụ: 0987654321" prefix={<PhoneOutlined />} />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            label="Mật Khẩu"
            rules={[
              { required: !editingId, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự' },
            ]}
            extra={editingId ? <span className="text-slate-400 text-xs">Để trống nếu giữ nguyên mật khẩu cũ</span> : null}
          >
            <Input.Password placeholder={editingId ? 'Nhập mật khẩu mới nếu muốn thay đổi...' : 'Nhập mật khẩu...'} prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Vai Trò Phân Quyền"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò...">
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {ROLE_LABEL_MAP[role.name] || role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-100 font-extrabold text-base">
            <UploadOutlined className="text-indigo-500" />
            <span>Nhập Người Dùng Từ Excel</span>
          </div>
        }
        open={isImportModalOpen}
        onOk={handleImport}
        onCancel={() => {
          if (!importing) {
            setIsImportModalOpen(false);
            setImportFile(null);
          }
        }}
        okText="Bắt đầu tải lên"
        cancelText="Huỷ bỏ"
        okButtonProps={{ 
          className: 'bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg font-semibold',
          loading: importing 
        }}
        cancelButtonProps={{
          className: 'rounded-lg hover:border-slate-300',
          disabled: importing
        }}
        destroyOnClose
        width={450}
      >
        <div className="mt-4 space-y-4">
          <p className="text-slate-500 text-xs leading-relaxed">
            Chọn một file Excel (.xlsx hoặc .xls) chứa thông tin người dùng cần thêm. File cần có các cột tối thiểu: 
            <span className="font-semibold text-slate-700"> Mã sinh viên/Mã người dùng, Họ và tên, Email, Vai trò</span>. 
            (Có thể thêm cột <span className="font-semibold text-slate-700">Số điện thoại</span>).
          </p>
          
          <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImportFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="excel-import-file-input"
              disabled={importing}
            />
            <label htmlFor="excel-import-file-input" className="cursor-pointer space-y-2 block">
              <UploadOutlined className="text-slate-400 text-3xl" />
              <div className="text-slate-600 dark:text-zinc-300 font-semibold text-sm">
                {importFile ? importFile.name : 'Nhấn vào đây để chọn file Excel'}
              </div>
              <div className="text-slate-400 text-xs">
                {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Hỗ trợ định dạng .xlsx, .xls'}
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentListPage;
