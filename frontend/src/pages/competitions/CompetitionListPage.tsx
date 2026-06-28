import { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, DatePicker, App, Space, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { competitionsService } from '../../services/competitions.service';
import type { Competition } from '../../services/competitions.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { Option } = Select;

export const CompetitionListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Competition[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedLevel, setSelectedLevel] = useState<'CENTRAL' | 'ACADEMY' | undefined>(undefined);

  const [form] = Form.useForm();
  
  const canManage = hasPermission('MANAGE_COMPETITION');

  const fetchSemesters = async () => {
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setSemesters(semesterList);
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const res = await competitionsService.list({
        search: search || undefined,
        semesterId: selectedSemester,
        level: selectedLevel,
        limit: 200,
      });
      if (res.success && res.data) {
        const competitionList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(competitionList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách cuộc thi');
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

  useEffect(() => {
    fetchCompetitions();
  }, [search, selectedSemester, selectedLevel]);

  const handleOpenAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: Competition) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      level: record.level,
      organizer: record.organizer,
      eventDate: dayjs(record.eventDate),
      semesterId: record.semesterId,
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      const res = await competitionsService.delete(id);
      if (res.success) {
        message.success('Xoá cuộc thi thành công');
        fetchCompetitions();
      } else {
        message.error(res.message || 'Không thể xoá cuộc thi');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xoá cuộc thi');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        level: values.level,
        organizer: values.organizer,
        eventDate: values.eventDate.toISOString(),
        semesterId: values.semesterId,
      };

      let res;
      if (editingId) {
        res = await competitionsService.update(editingId, payload);
      } else {
        res = await competitionsService.create(payload);
      }

      if (res.success) {
        message.success(editingId ? 'Cập nhật cuộc thi thành công' : 'Thêm cuộc thi thành công');
        setIsModalOpen(false);
        fetchCompetitions();
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
      title: 'Tên Cuộc Thi',
      dataIndex: 'name',
      key: 'name',
      className: 'font-semibold text-slate-700',
    },
    {
      title: 'Cấp Độ',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const isCentral = level === 'CENTRAL';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isCentral ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
            {isCentral ? 'Cấp Trung Ương' : 'Cấp Học Viện'}
          </span>
        );
      },
    },
    {
      title: 'Đơn Vị Tổ Chức',
      dataIndex: 'organizer',
      key: 'organizer',
      render: (text?: string) => text || 'Chưa cập nhật',
    },
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semesterName',
    },
    {
      title: 'Ngày Tổ Chức',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    ...(canManage
      ? [
          {
            title: 'Hành Động',
            key: 'action',
            width: 150,
            render: (_: any, record: Competition) => (
              <Space size="middle">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-blue-500 hover:scale-110 transition-transform" />}
                  onClick={() => handleOpenEdit(record)}
                />
                <Popconfirm
                  title="Xác nhận xoá cuộc thi?"
                  description="Sinh viên đã nộp thành tích cho cuộc thi này sẽ bị ảnh hưởng."
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
        title="Danh Sách Cuộc Thi"
        subtitle="Quản lý các cuộc thi quy mô Trung Ương và Học Viện"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Cuộc thi' }]}
        extra={
          canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
              className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm"
            >
              Thêm Cuộc Thi
            </Button>
          )
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm tên cuộc thi..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              className="w-full"
              placeholder="Lọc theo Học kỳ"
              allowClear
              value={selectedSemester}
              onChange={setSelectedSemester}
            >
              {semesters.map((sem) => (
                <Option key={sem.id} value={sem.id}>
                  {sem.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              className="w-full"
              placeholder="Lọc cấp độ"
              allowClear
              value={selectedLevel}
              onChange={setSelectedLevel}
            >
              <Option value="CENTRAL">Cấp Trung Ương</Option>
              <Option value="ACADEMY">Cấp Học Viện</Option>
            </Select>
          </Col>
        </Row>

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
        title={editingId ? 'Cập Nhật Cuộc Thi' : 'Tạo Cuộc Thi Mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên Cuộc Thi"
            rules={[{ required: true, message: 'Vui lòng nhập tên cuộc thi' }]}
          >
            <Input placeholder="Ví dụ: Olympic Tin học sinh viên toàn quốc" prefix={<TrophyOutlined />} />
          </Form.Item>

          <Form.Item
            name="semesterId"
            label="Học Kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
          >
            <Select placeholder="Chọn học kỳ tổ chức">
              {semesters.map((sem) => (
                <Option key={sem.id} value={sem.id}>
                  {sem.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="level"
              label="Cấp Độ"
              rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
            >
              <Select placeholder="Chọn cấp độ">
                <Option value="CENTRAL">Cấp Trung Ương</Option>
                <Option value="ACADEMY">Cấp Học Viện</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="eventDate"
              label="Ngày Tổ Chức"
              rules={[{ required: true, message: 'Vui lòng chọn ngày tổ chức' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="organizer"
            label="Đơn Vị Tổ Chức"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị tổ chức' }]}
          >
            <Input placeholder="Ví dụ: Hội Tin học Việt Nam / Khoa CNTT" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompetitionListPage;
