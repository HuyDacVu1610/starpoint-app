import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, App, Button } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  FileExcelOutlined,
  StarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { dashboardService } from '../services/dashboard.service';
import { semestersService } from '../services/semesters.service';
import type { Semester } from '../services/semesters.service';
import StatCard from '../components/StatCard';

const { Option } = Select;

const CATEGORY_LABELS: Record<string, string> = {
  CENTRAL_COMPETITION: 'Cấp T.Ư',
  ACADEMY_COMPETITION: 'Cấp Trường',
  ORGANIZATION_PARTICIPATION: 'Ban T.C',
  SPECIAL_ACHIEVEMENT: 'Đặc Biệt',
};

const GRADE_COLORS: Record<string, string> = {
  EXCELLENT: '#10b981', // green
  GOOD: '#3b82f6',      // blue
  FAIR: '#f59e0b',      // yellow/orange
  AVERAGE: '#64748b',   // slate
  WEAK: '#ef4444',      // red
  POOR: '#b91c1c',      // dark red
};

const GRADE_LABELS: Record<string, string> = {
  EXCELLENT: 'Xuất sắc',
  GOOD: 'Giỏi',
  FAIR: 'Khá',
  AVERAGE: 'T.Bình',
  WEAK: 'Yếu',
  POOR: 'Kém',
};

export const DashboardPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [loadingSemesters, setLoadingSemesters] = useState(true);

  const [stats, setStats] = useState<{
    totalStudents: number;
    totalCompetitions: number;
    totalAchievements: number;
    eligibleScholarships: number;
  } | null>(null);
  
  const [charts, setCharts] = useState<{
    categoryData: Array<{ category: string; count: number }>;
    gradeData: Array<{ grade: string; count: number }>;
  } | null>(null);

  const [loadingData, setLoadingData] = useState(false);

  const fetchSemesters = async () => {
    setLoadingSemesters(true);
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setSemesters(list);
        if (list.length > 0) {
          setSelectedSemester(list[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchDashboardData = async (semesterId?: number) => {
    if (!semesterId) return;
    setLoadingData(true);
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardService.getStats(semesterId),
        dashboardService.getCharts(semesterId),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (chartsRes.success && chartsRes.data) {
        setCharts(chartsRes.data);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchDashboardData(selectedSemester);
    }
  }, [selectedSemester]);

  // Compute SVG Donut Chart parameters
  const getDonutSegments = () => {
    if (!charts || charts.gradeData.length === 0) return [];
    const total = charts.gradeData.reduce((acc, c) => acc + c.count, 0);
    if (total === 0) return [];

    let accumAngle = 0;
    const r = 50;
    const cx = 60;
    const cy = 60;
    const circumference = 2 * Math.PI * r;

    return charts.gradeData.map((item) => {
      const percentage = item.count / total;
      const strokeLength = percentage * circumference;
      const strokeOffset = circumference - strokeLength + accumAngle;
      accumAngle -= strokeLength;

      return {
        label: GRADE_LABELS[item.grade] || item.grade,
        count: item.count,
        color: GRADE_COLORS[item.grade] || '#cbd5e1',
        strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
        strokeDashoffset: strokeOffset,
        cx,
        cy,
        r,
        percentage: (percentage * 100).toFixed(1),
      };
    });
  };

  const donutSegments = getDonutSegments();
  const maxCategoryCount = charts?.categoryData.reduce((acc, c) => Math.max(acc, c.count), 0) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bảng Điều Khiển Hệ Thống"
        subtitle="Quản lý và thống kê tình hình học bổng, minh chứng điểm rèn luyện của sinh viên"
        breadcrumbs={[{ title: 'Trang chủ' }, { title: 'Bảng điều khiển' }]}
        extra={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Lọc theo Học kỳ:</span>
            <Select
              placeholder="Chọn học kỳ..."
              loading={loadingSemesters}
              value={selectedSemester}
              onChange={setSelectedSemester}
              className="min-w-[200px]"
            >
              {semesters.map((sem) => (
                <Option key={sem.id} value={sem.id}>
                  {sem.name}
                </Option>
              ))}
            </Select>
          </div>
        }
      />

      {loadingData ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Spin size="large" tip="Đang nạp dữ liệu phân tích hệ thống..." />
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Tổng Sinh Viên"
                value={stats?.totalStudents || 0}
                icon={<UserOutlined />}
                colorClass="bg-blue-50 text-blue-600"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Cuộc Thi Kỳ Này"
                value={stats?.totalCompetitions || 0}
                icon={<CalendarOutlined />}
                colorClass="bg-purple-50 text-purple-600"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Thành Tích Đã Duyệt"
                value={stats?.totalAchievements || 0}
                icon={<TrophyOutlined />}
                colorClass="bg-amber-50 text-amber-600"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Đạt Chuẩn Học Bổng"
                value={stats?.eligibleScholarships || 0}
                icon={<FileProtectOutlined />}
                colorClass="bg-emerald-50 text-emerald-600"
              />
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={<span className="font-extrabold text-slate-800 text-sm">Phân Bố Thành Tích Theo Loại</span>}
                className="border border-slate-100 rounded-xl shadow-sm overflow-hidden h-[340px]"
              >
                {charts && charts.categoryData.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {charts.categoryData.map((item) => {
                      const pct = (item.count / maxCategoryCount) * 100;
                      return (
                        <div key={item.category} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>{CATEGORY_LABELS[item.category] || item.category}</span>
                            <span className="text-slate-500">{item.count} minh chứng</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                            <div
                              style={{ width: `${Math.max(pct, 5)}%` }}
                              className="bg-indigo-600 h-full rounded-lg transition-all duration-500 ease-out"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-400 text-xs">
                    Không có dữ liệu thành tích được duyệt trong học kỳ này
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={<span className="font-extrabold text-slate-800 text-sm">Tỷ Lệ Xếp Loại GPA Mở Rộng</span>}
                className="border border-slate-100 rounded-xl shadow-sm overflow-hidden h-[340px]"
              >
                {donutSegments.length > 0 ? (
                  <div className="flex flex-col sm:flex-row justify-around items-center h-full gap-4 pt-2">
                    <div className="relative w-40 h-40">
                      <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                        {donutSegments.map((seg, idx) => (
                          <circle
                            key={idx}
                            cx={seg.cx}
                            cy={seg.cy}
                            r={seg.r}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="12"
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={seg.strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col justify-center items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng xếp loại</span>
                        <strong className="text-lg text-slate-800 font-black">
                          {charts?.gradeData.reduce((acc, c) => acc + c.count, 0)}
                        </strong>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                      {donutSegments.map((seg, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span style={{ backgroundColor: seg.color }} className="w-3 h-3 rounded-full" />
                          <span>
                            {seg.label}: <strong className="text-slate-700">{seg.count}</strong> ({seg.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-400 text-xs">
                    Chưa có bảng điểm quy đổi cho học kỳ này
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Quick Actions Row */}
          <Card
            title={<span className="font-extrabold text-slate-800 text-sm">Phím Tắt Nghiệp Vụ Nhanh</span>}
            className="border border-slate-100 rounded-xl shadow-sm overflow-hidden"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button
                  block
                  icon={<FileExcelOutlined />}
                  onClick={() => navigate('/admin/bonus-points')}
                  className="h-16 rounded-xl flex flex-col items-center justify-center border-emerald-100 text-emerald-700 hover:border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/50 shadow-sm transition-colors text-xs font-bold"
                >
                  Nhập Điểm Excel
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  icon={<StarOutlined />}
                  onClick={() => navigate('/admin/scholarships')}
                  className="h-16 rounded-xl flex flex-col items-center justify-center border-indigo-100 text-indigo-700 hover:border-indigo-300 bg-indigo-50/20 hover:bg-indigo-50/50 shadow-sm transition-colors text-xs font-bold"
                >
                  Chạy Xét Học Bổng
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  icon={<TrophyOutlined />}
                  onClick={() => navigate('/admin/achievements')}
                  className="h-16 rounded-xl flex flex-col items-center justify-center border-amber-100 text-amber-700 hover:border-amber-300 bg-amber-50/20 hover:bg-amber-50/50 shadow-sm transition-colors text-xs font-bold"
                >
                  Duyệt Thành Tích
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/admin/semesters')}
                  className="h-16 rounded-xl flex flex-col items-center justify-center border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 shadow-sm transition-colors text-xs font-bold"
                >
                  Quản Lý Học Kỳ
                </Button>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
