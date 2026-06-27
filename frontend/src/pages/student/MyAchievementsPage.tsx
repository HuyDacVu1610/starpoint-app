import { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Select, Upload, Tag, App, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { achievementsService } from '../../services/achievements.service';
import type { Achievement } from '../../services/achievements.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { competitionsService } from '../../services/competitions.service';
import type { Competition } from '../../services/competitions.service';
import { uploadService } from '../../services/upload.service';
import { PageHeader } from '../../components/PageHeader';

const { Option } = Select;
const { Dragger } = Upload;

const CATEGORY_MAP: Record<string, string> = {
  CENTRAL_COMPETITION: 'Cấp Trung Ương',
  ACADEMY_COMPETITION: 'Cấp Học Viện',
  ORGANIZATION_PARTICIPATION: 'Cấp Lớp/Khoa',
  SPECIAL_ACHIEVEMENT: 'Thành tích đặc biệt',
  CENTRAL: 'Cấp Trung Ương',
  ACADEMY: 'Cấp Học Viện',
  CLASS: 'Cấp Lớp/Khoa',
};

const RANK_MAP: Record<string, string> = {
  FIRST: 'Giải Nhất',
  SECOND: 'Giải Nhì',
  THIRD: 'Giải Ba',
  NONE: 'Tham Gia / Khác',
  ENCOURAGE: 'Giải Khuyến Khích',
  PARTICIPATE: 'Tham Gia',
};

export const MyAchievementsPage = () => {
  const { message } = App.useApp();
  const [data, setData] = useState<Achievement[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const [form] = Form.useForm();
  const selectedSemester = Form.useWatch('semesterId', form);
  const selectedCategory = Form.useWatch('category', form);

  const fetchMyAchievements = async () => {
    setLoading(true);
    try {
      const res = await achievementsService.listMy({ limit: 100 });
      if (res.success && res.data) {
        const achievementList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(achievementList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách thành tích');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchCompetitions = async (semesterId: number, category: string) => {
    if (category !== 'CENTRAL_COMPETITION' && category !== 'ACADEMY_COMPETITION') {
      setCompetitions([]);
      form.setFieldValue('competitionId', undefined);
      return;
    }

    try {
      const level = category === 'CENTRAL_COMPETITION' ? 'CENTRAL' : 'ACADEMY';
      const res = await competitionsService.list({
        semesterId,
        level,
        limit: 200,
      });
      if (res.success && res.data) {
        const competitionList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setCompetitions(competitionList);
      }
    } catch (err) {
      console.error('Error fetching competitions:', err);
    }
  };

  useEffect(() => {
    fetchMyAchievements();
    fetchSemesters();
  }, []);

  // Fetch competitions reactively when semester or category changes
  useEffect(() => {
    if (selectedSemester && selectedCategory) {
      fetchCompetitions(selectedSemester, selectedCategory);
      if (selectedCategory === 'ORGANIZATION_PARTICIPATION' || selectedCategory === 'SPECIAL_ACHIEVEMENT') {
        form.setFieldValue('rank', 'NONE');
      } else {
        form.setFieldValue('rank', undefined);
      }
    } else {
      setCompetitions([]);
      form.setFieldValue('competitionId', undefined);
      form.setFieldValue('rank', undefined);
    }
  }, [selectedSemester, selectedCategory]);

  const handleOpenAdd = () => {
    form.resetFields();
    setUploadedFileId(null);
    setUploadedFileName('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await achievementsService.delete(id);
      if (res.success) {
        message.success('Huỷ yêu cầu thành tích thành công');
        fetchMyAchievements();
      } else {
        message.error(res.message || 'Không thể huỷ yêu cầu');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi huỷ yêu cầu');
    }
  };

  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadService.upload(file as File);
      setUploadedFileId(res.id);
      setUploadedFileName(res.originalName);
      form.setFieldValue('evidenceFileId', res.id);
      onSuccess(res);
      message.success(`Đã tải lên file ${res.originalName}`);
    } catch (err: any) {
      onError(err);
      message.error(err.response?.data?.message || 'Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        semesterId: values.semesterId,
        category: values.category,
        rank: (values.category === 'ORGANIZATION_PARTICIPATION' || values.category === 'SPECIAL_ACHIEVEMENT')
          ? 'NONE'
          : values.rank,
        competitionId: values.competitionId || null,
        evidenceFileId: uploadedFileId || undefined,
        note: values.note,
      };

      const res = await achievementsService.create(payload);
      if (res.success) {
        message.success('Gửi minh chứng thành công, vui lòng chờ duyệt');
        setIsModalOpen(false);
        fetchMyAchievements();
      } else {
        message.error(res.message || 'Lỗi gửi minh chứng');
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

  const getEvidenceUrl = (record: Achievement) => {
    if (record.evidenceFile?.storedPath) {
      const base = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');
      return `${base}/uploads/${record.evidenceFile.storedPath}`;
    }
    return record.evidence || '';
  };

  const columns = [
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semesterName',
    },
    {
      title: 'Loại Hoạt Động',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => CATEGORY_MAP[cat] || cat,
    },
    {
      title: 'Hoạt Động / Cuộc Thi',
      key: 'competitionName',
      render: (_: any, record: Achievement) => {
        return record.competition ? record.competition.name : 'Hoạt động tự do';
      },
    },
    {
      title: 'Giải Thưởng / Vai Trò',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: string) => RANK_MAP[rank] || rank,
    },
    {
      title: 'Minh Chứng',
      key: 'evidence',
      width: 120,
      render: (_: any, record: Achievement) => {
        const url = getEvidenceUrl(record);
        if (!url) return <span className="text-slate-400">Không có</span>;
        return (
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
          >
            Mở file
          </Button>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'gold';
        let text = 'Chờ duyệt';
        if (status === 'APPROVED') {
          color = 'green';
          text = 'Đã duyệt';
        } else if (status === 'REJECTED') {
          color = 'red';
          text = 'Từ chối';
        }
        return <Tag color={color} className="font-semibold uppercase px-2 py-0.5 rounded-full">{text}</Tag>;
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 120,
      render: (_: any, record: Achievement) => {
        if (record.status !== 'PENDING') return <span className="text-slate-400">-</span>;
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="hover:scale-105 transition-transform"
          >
            Huỷ bỏ
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Thành Tích Cá Nhân"
        subtitle="Quản lý và nộp các minh chứng đạt giải cuộc thi, hoạt động của bạn"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Thành tích cá nhân' }]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm"
          >
            Nộp Minh Chứng
          </Button>
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md overflow-hidden">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Nộp Minh Chứng Thành Tích Mới"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi duyệt"
        cancelText="Huỷ"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700', loading: uploading }}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="semesterId"
              label="Học Kỳ"
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
            >
              <Select placeholder="Chọn học kỳ">
                {semesters.map((sem) => (
                  <Option key={sem.id} value={sem.id}>
                    {sem.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="Danh Mục Hoạt Động"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn cấp độ">
                <Option value="CENTRAL_COMPETITION">Cấp Trung Ương</Option>
                <Option value="ACADEMY_COMPETITION">Cấp Học Viện</Option>
                <Option value="ORGANIZATION_PARTICIPATION">Cấp Lớp/Khoa / Ban Tổ Chức</Option>
                <Option value="SPECIAL_ACHIEVEMENT">Thành Tích Đặc Biệt</Option>
              </Select>
            </Form.Item>
          </div>

          {selectedCategory && (selectedCategory === 'CENTRAL_COMPETITION' || selectedCategory === 'ACADEMY_COMPETITION') && (
            <Form.Item
              name="competitionId"
              label="Cuộc Thi Tổ Chức"
              rules={[{ required: true, message: 'Vui lòng chọn cuộc thi liên kết' }]}
            >
              <Select
                placeholder={
                  competitions.length > 0
                    ? 'Chọn cuộc thi bạn tham gia...'
                    : 'Không tìm thấy cuộc thi nào trong học kỳ và danh mục này'
                }
                disabled={competitions.length === 0}
              >
                {competitions.map((comp) => (
                  <Option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.organizer})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedCategory && selectedCategory !== 'ORGANIZATION_PARTICIPATION' && selectedCategory !== 'SPECIAL_ACHIEVEMENT' && (
            <Form.Item
              name="rank"
              label="Xếp Giải / Kết Quả Đạt Được"
              rules={[{ required: true, message: 'Vui lòng chọn xếp giải' }]}
            >
              <Select placeholder="Chọn xếp giải">
                <Option value="FIRST">Giải Nhất</Option>
                <Option value="SECOND">Giải Nhì</Option>
                <Option value="THIRD">Giải Ba</Option>
                <Option value="NONE">Tham Gia / Khác / Khuyến Khích</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="note"
            label="Ghi Chú Chi Tiết (Tuỳ chọn)"
          >
            <Input.TextArea placeholder="Nhập thêm thông tin mô tả chi tiết nếu cần thiết..." rows={2} />
          </Form.Item>

          <Form.Item
            label="File Minh Chứng (PDF, Ảnh tối đa 5MB)"
            required
            rules={[{
              validator: (_, __) => {
                if (uploadedFileId) return Promise.resolve();
                return Promise.reject(new Error('Vui lòng tải lên file minh chứng hợp lệ'));
              }
            }]}
          >
            <Dragger
              name="file"
              multiple={false}
              maxCount={1}
              customRequest={handleCustomUpload}
              showUploadList={false}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon text-indigo-500">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text font-semibold text-slate-700">
                Kéo thả file vào đây hoặc click để chọn file
              </p>
              <p className="ant-upload-hint text-slate-400 text-xs">
                Chấp nhận tệp hình ảnh (.jpg, .png, .webp) hoặc .pdf tối đa 5MB.
              </p>
            </Dragger>

            {uploadedFileName && (
              <div className="mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                <span className="text-slate-600 text-xs font-semibold flex items-center gap-1.5">
                  <FileTextOutlined className="text-indigo-500" />
                  {uploadedFileName}
                </span>
                <Button
                  size="small"
                  type="text"
                  danger
                  onClick={() => {
                    setUploadedFileId(null);
                    setUploadedFileName('');
                    form.setFieldValue('evidenceFileId', undefined);
                  }}
                >
                  Xoá
                </Button>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAchievementsPage;
