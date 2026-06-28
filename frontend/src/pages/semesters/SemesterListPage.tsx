import { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Input, InputNumber, DatePicker, App, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

export const SemesterListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const canManage = hasPermission('MANAGE_SEMESTER');

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        // Handle pagination data format
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(semesterList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách học kỳ');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleOpenAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: Semester) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      year: record.year,
      term: record.term,
      dates: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      const res = await semestersService.delete(id);
      if (res.success) {
        message.success('Xoá học kỳ thành công');
        fetchSemesters();
      } else {
        message.error(res.message || 'Không thể xoá học kỳ');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể xoá học kỳ. Vui lòng kiểm tra liên kết dữ liệu.';
      message.error(errMsg);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dates;

      const payload = {
        name: values.name,
        year: values.year,
        term: values.term,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      let res;
      if (editingId) {
        res = await semestersService.update(editingId, payload);
      } else {
        res = await semestersService.create(payload);
      }

      if (res.success) {
        message.success(editingId ? 'Cập nhật học kỳ thành công' : 'Thêm học kỳ thành công');
        setIsModalOpen(false);
        fetchSemesters();
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

  const columns = [
    {
      title: 'Tên Học Kỳ',
      dataIndex: 'name',
      key: 'name',
      className: 'font-semibold text-slate-700',
    },
    {
      title: 'Năm Học',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Kỳ Số',
      dataIndex: 'term',
      key: 'term',
    },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    ...(canManage
      ? [
          {
            title: 'Hành Động',
            key: 'action',
            width: 150,
            render: (_: any, record: Semester) => (
              <Space size="middle">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-blue-500 hover:scale-110 transition-transform" />}
                  onClick={() => handleOpenEdit(record)}
                />
                <Popconfirm
                  title="Xác nhận xoá học kỳ này?"
                  description="Thao tác này không thể hoàn tác và sẽ kiểm tra các liên kết cuộc thi."
                  onConfirm={() => handleConfirmDelete(record.id)}
                  okText="Xoá"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined className="hover:scale-110 transition-transform" />}
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh Sách Học Kỳ"
        subtitle="Quản lý thời gian bắt đầu, kết thúc của các năm học"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Học kỳ' }]}
        extra={
          canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
              className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm"
            >
              Thêm Học Kỳ
            </Button>
          )
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md overflow-hidden">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Cập Nhật Học Kỳ' : 'Tạo Học Kỳ Mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ bỏ"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên Học Kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên học kỳ (ví dụ: Học kỳ 1 2026-2027)' }]}
          >
            <Input placeholder="Nhập tên học kỳ..." prefix={<CalendarOutlined />} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="year"
              label="Năm Học"
              rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
            >
              <InputNumber min={2020} max={2100} className="w-full" placeholder="Ví dụ: 2026" />
            </Form.Item>

            <Form.Item
              name="term"
              label="Kỳ Số (Term)"
              rules={[{ required: true, message: 'Vui lòng nhập số kỳ học' }]}
            >
              <InputNumber min={1} max={2} className="w-full" placeholder="1 hoặc 2" />
            </Form.Item>
          </div>

          <Form.Item
            name="dates"
            label="Thời Gian Học Kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu & kết thúc' }]}
          >
            <DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SemesterListPage;
