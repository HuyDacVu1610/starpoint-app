import { useState, useEffect } from 'react';
import { Table, Button, Card, Select, Input, Tag, Space, App, Row, Col, Tooltip } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { achievementsService } from '../../services/achievements.service';
import type { Achievement } from '../../services/achievements.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';

const { Option } = Select;

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

export const AchievementListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Achievement[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const canReview = hasPermission('MANAGE_ACHIEVEMENT');

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

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await achievementsService.list({
        search: search || undefined,
        semesterId: selectedSemester,
        category: selectedCategory,
        status: selectedStatus,
        limit: 200,
      });
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

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [search, selectedSemester, selectedCategory, selectedStatus]);

  const handleReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await achievementsService.review(id, status);
      if (res.success) {
        message.success(status === 'APPROVED' ? 'Đã duyệt thành tích' : 'Đã từ chối thành tích');
        fetchAchievements();
      } else {
        message.error(res.message || 'Không thể thực hiện phê duyệt');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi phê duyệt thành tích');
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
      title: 'Mã SV',
      dataIndex: ['user', 'studentCode'],
      key: 'studentCode',
      className: 'font-semibold text-slate-700',
    },
    {
      title: 'Họ và Tên',
      dataIndex: ['user', 'fullName'],
      key: 'fullName',
    },
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semesterName',
    },
    {
      title: 'Hoạt Động / Cuộc Thi',
      key: 'competitionName',
      render: (_: any, record: Achievement) => {
        return record.competition ? record.competition.name : 'Hoạt động tự do / Tự lập';
      },
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => CATEGORY_MAP[cat] || cat,
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
            type="primary"
            ghost
            size="small"
            icon={<FileTextOutlined />}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-indigo-400 text-indigo-600 hover:border-indigo-600 hover:text-indigo-800 rounded-md"
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
        let text = 'Đang chờ';
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
    ...(canReview
      ? [
          {
            title: 'Duyệt',
            key: 'action',
            width: 120,
            render: (_: any, record: Achievement) => {
              if (record.status !== 'PENDING') return null;
              return (
                <Space size="small">
                  <Tooltip title="Duyệt thành tích">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleReview(record.id, 'APPROVED')}
                      className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm flex items-center justify-center"
                    />
                  </Tooltip>
                  <Tooltip title="Từ chối">
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleReview(record.id, 'REJECTED')}
                      className="shadow-sm flex items-center justify-center"
                    />
                  </Tooltip>
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Duyệt Thành Tích Sinh Viên"
        subtitle="Rà soát, kiểm tra file minh chứng và phê duyệt điểm cộng thành tích học tập/thi đấu"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Duyệt thành tích' }]}
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Input
              placeholder="Tìm theo Mã SV hoặc Họ tên..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </Col>
          <Col xs={24} sm={6}>
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
          <Col xs={24} sm={6}>
            <Select
              className="w-full"
              placeholder="Lọc theo Trạng thái"
              allowClear
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="PENDING">Đang chờ duyệt</Option>
              <Option value="APPROVED">Đã phê duyệt</Option>
              <Option value="REJECTED">Bị từ chối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              className="w-full"
              placeholder="Lọc theo Danh mục"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="CENTRAL_COMPETITION">Cấp Trung Ương</Option>
              <Option value="ACADEMY_COMPETITION">Cấp Học Viện</Option>
              <Option value="ORGANIZATION_PARTICIPATION">Cấp Lớp/Khoa / Ban Tổ Chức</Option>
              <Option value="SPECIAL_ACHIEVEMENT">Thành Tích Đặc Biệt</Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default AchievementListPage;
