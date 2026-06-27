import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Descriptions, Spin, Tag, App, Button, Space } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, FileProtectOutlined, CompassOutlined, FileTextOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/PageHeader';
import { usersService } from '../../services/users.service';
import type { User } from '../../services/users.service';
import { achievementsService } from '../../services/achievements.service';
import type { Achievement } from '../../services/achievements.service';
import { scoresService } from '../../services/scores.service';
import type { Score } from '../../services/scores.service';
import { scholarshipsService } from '../../services/scholarships.service';
import type { ScholarshipCandidate } from '../../services/scholarships.service';
import DataTable from '../../components/DataTable';
import GradeTag from '../../components/GradeTag';
import BonusPointBadge from '../../components/BonusPointBadge';

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

const CATEGORY_LABEL_MAP: Record<string, string> = {
  CENTRAL_COMPETITION: 'Cuộc thi Cấp Trung ương',
  ACADEMY_COMPETITION: 'Cuộc thi Cấp Trường/Khoa',
  ORGANIZATION_PARTICIPATION: 'Tham gia Ban Tổ chức',
  SPECIAL_ACHIEVEMENT: 'Thành tích Đặc biệt khác',
};

const SCHOLARSHIP_TIER_MAP: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: 'Xuất Sắc', color: 'red' },
  GOOD: { label: 'Giỏi', color: 'orange' },
  FAIR: { label: 'Khá', color: 'blue' },
  NONE: { label: 'Không Đạt', color: 'default' },
};

export const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Tab Data States
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  const [scores, setScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const [scholarships, setScholarships] = useState<ScholarshipCandidate[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState(false);

  const fetchUserData = async () => {
    if (!id) return;
    setLoadingUser(true);
    try {
      const res = await usersService.get(Number(id));
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        message.error(res.message || 'Không thể tải thông tin sinh viên');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu người dùng');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchAchievements = async () => {
    if (!id) return;
    setLoadingAchievements(true);
    try {
      const res = await achievementsService.list({ userId: Number(id), limit: 100 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setAchievements(list);
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const fetchScores = async () => {
    if (!id) return;
    setLoadingScores(true);
    try {
      const res = await scoresService.list({ userId: Number(id), limit: 100 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setScores(list);
      }
    } catch (err) {
      console.error('Error fetching scores:', err);
    } finally {
      setLoadingScores(false);
    }
  };

  const fetchScholarships = async () => {
    if (!id) return;
    setLoadingScholarships(true);
    try {
      const res = await scholarshipsService.listCandidates({ userId: Number(id), limit: 100 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setScholarships(list);
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoadingScholarships(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAchievements();
    fetchScores();
    fetchScholarships();
  }, [id]);

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu sinh viên..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy tài khoản người dùng</h3>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Define Columns
  const achievementColumns = [
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semester',
    },
    {
      title: 'Tên Cuộc Thi / Hoạt Động',
      dataIndex: ['competition', 'name'],
      key: 'competition',
      render: (name: string, record: Achievement) => name || record.note || 'Hoạt động tự do',
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => CATEGORY_LABEL_MAP[cat] || cat,
    },
    {
      title: 'Xếp Giải / Vai Trò',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: string) => (rank === 'NONE' ? 'Tham gia / Khác' : rank),
    },
    {
      title: 'Điểm Cộng',
      dataIndex: 'bonusPoint',
      key: 'bonusPoint',
      render: (val: number) => <BonusPointBadge points={val} />,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = 'Chờ duyệt';
        if (status === 'APPROVED') {
          color = 'success';
          label = 'Đã duyệt';
        } else if (status === 'REJECTED') {
          color = 'error';
          label = 'Từ chối';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Minh Chứng',
      dataIndex: 'evidenceFile',
      key: 'evidence',
      render: (file: any) =>
        file ? (
          <a
            href={`/uploads/${file.storedPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Xem tệp đính kèm
          </a>
        ) : (
          <span className="text-slate-400 font-medium">Không đính kèm</span>
        ),
    },
  ];

  const scoreColumns = [
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semesterName',
    },
    {
      title: 'GPA gốc',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Điểm Cộng Thưởng',
      dataIndex: 'maxBonusPoint',
      key: 'maxBonusPoint',
      render: (val: number) => <BonusPointBadge points={val} />,
    },
    {
      title: 'GPA Mở Rộng',
      dataIndex: 'extendedGpa',
      key: 'extendedGpa',
      className: 'font-extrabold text-indigo-600',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Xếp Loại GPA',
      dataIndex: 'gpaGrade',
      key: 'gpaGrade',
      render: (grade: string) => <GradeTag grade={grade} />,
    },
    {
      title: 'Điểm Rèn Luyện',
      dataIndex: 'conductScore',
      key: 'conductScore',
    },
    {
      title: 'Xếp Loại RL',
      dataIndex: 'conductGrade',
      key: 'conductGrade',
      render: (grade: string) => <GradeTag grade={grade} />,
    },
  ];

  const scholarshipColumns = [
    {
      title: 'Học Kỳ',
      dataIndex: ['semester', 'name'],
      key: 'semester',
    },
    {
      title: 'GPA Quy Đổi',
      dataIndex: 'extendedGpa',
      key: 'extendedGpa',
      className: 'font-bold',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Đủ Điều Kiện',
      dataIndex: 'isEligible',
      key: 'isEligible',
      render: (isEligible: boolean) => (
        <Tag color={isEligible ? 'success' : 'error'} className="font-semibold rounded-full px-2">
          {isEligible ? 'Đạt chuẩn' : 'Không đạt'}
        </Tag>
      ),
    },
    {
      title: 'Học Bổng Xét Duyệt',
      dataIndex: 'scholarshipTier',
      key: 'scholarshipTier',
      render: (tier: string) => {
        const tierObj = SCHOLARSHIP_TIER_MAP[tier] || { label: 'Không nhận', color: 'default' };
        return <Tag color={tierObj.color} className="font-extrabold">{tierObj.label}</Tag>;
      },
    },
    {
      title: 'Nhận xét lý do',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => <span className="text-xs text-slate-500 font-medium">{note || '-'}</span>,
    },
  ];

  const items = [
    {
      key: 'achievements',
      label: (
        <span>
          <TrophyOutlined /> Thành tích
        </span>
      ),
      children: (
        <DataTable
          dataSource={achievements}
          columns={achievementColumns}
          rowKey="id"
          loading={loadingAchievements}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'scores',
      label: (
        <span>
          <CompassOutlined /> Điểm rèn luyện & Điểm thưởng
        </span>
      ),
      children: (
        <DataTable
          dataSource={scores}
          columns={scoreColumns}
          rowKey="id"
          loading={loadingScores}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'scholarships',
      label: (
        <span>
          <FileProtectOutlined /> Kết quả học bổng
        </span>
      ),
      children: (
        <DataTable
          dataSource={scholarships}
          columns={scholarshipColumns}
          rowKey="id"
          loading={loadingScholarships}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hồ Sơ Chi Tiết Người Dùng"
        subtitle="Quản lý lịch sử nộp minh chứng, bảng điểm tích luỹ và kết quả xét học bổng"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Người dùng', path: '/admin/students' }, { title: user.fullName }]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')} className="rounded-lg font-semibold">
            Quay Lại
          </Button>
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white overflow-hidden">
        <Descriptions
          title={<span className="text-slate-800 font-extrabold text-base flex items-center gap-1.5"><FileTextOutlined className="text-indigo-500" /> Thông Tin Sinh Viên / Người Dùng</span>}
          bordered
          column={{ xs: 1, sm: 2 }}
        >
          <Descriptions.Item label="MSSV / Mã Người Dùng" className="font-semibold text-slate-700">
            {user.studentCode}
          </Descriptions.Item>
          <Descriptions.Item label="Họ và Tên">{user.fullName}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.phone || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Vai trò hệ thống" span={2}>
            <Space>
              {user.userRoles?.map((ur) => {
                const roleName = ur.role.name;
                return (
                  <Tag color={ROLE_COLOR_MAP[roleName] || 'default'} key={roleName} className="font-semibold uppercase">
                    {ROLE_LABEL_MAP[roleName] || roleName}
                  </Tag>
                );
              })}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white overflow-hidden p-2">
        <Tabs defaultActiveKey="achievements" items={items} />
      </Card>
    </div>
  );
};

export default StudentDetailPage;
