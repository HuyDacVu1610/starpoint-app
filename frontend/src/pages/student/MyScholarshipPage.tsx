import { useState, useEffect } from 'react';
import { Card, Select, Result, Spin, Alert, Tag, message } from 'antd';
import { StarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { scholarshipsService } from '../../services/scholarships.service';
import type { ScholarshipCandidate } from '../../services/scholarships.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';

const { Option } = Select;

const TIER_MAP: Record<string, { label: string; subLabel: string; gradient: string; textClass: string; badgeClass: string }> = {
  EXCELLENT: {
    label: 'Học Bổng Xuất Sắc',
    subLabel: 'Excellent Scholarship Award',
    gradient: 'from-rose-500 via-pink-500 to-red-600',
    textClass: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  GOOD: {
    label: 'Học Bổng Giỏi',
    subLabel: 'Good Scholarship Award',
    gradient: 'from-amber-400 via-orange-500 to-yellow-600',
    textClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  FAIR: {
    label: 'Học Bổng Khá',
    subLabel: 'Fair Scholarship Award',
    gradient: 'from-blue-500 via-indigo-500 to-cyan-600',
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-600 border-blue-200',
  },
};

export const MyScholarshipPage = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [candidate, setCandidate] = useState<ScholarshipCandidate | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSemesters = async () => {
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setSemesters(semesterList);
        if (semesterList.length > 0) {
          try {
            const activeRes = await semestersService.getActiveSemester();
            if (activeRes.success && activeRes.data) {
              const activeId = activeRes.data.id;
              if (semesterList.find((s: any) => s.id === activeId)) {
                setSelectedSemester(activeId);
                return;
              }
            }
          } catch {
            // fall through
          }
          setSelectedSemester(semesterList[semesterList.length - 1].id);
        }
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchMyScholarship = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    setCandidate(null);
    try {
      const res = await scholarshipsService.listMy({ semesterId: selectedSemester });
      if (res.success && res.data) {
        const list: ScholarshipCandidate[] = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        if (list.length > 0) {
          setCandidate(list[0]);
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải kết quả học bổng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchMyScholarship();
  }, [selectedSemester]);

  const tierInfo = candidate && candidate.isEligible && candidate.scholarshipTier !== 'NONE'
    ? TIER_MAP[candidate.scholarshipTier] || {
        label: 'Học bổng khuyến khích',
        subLabel: 'Scholarship Award',
        gradient: 'from-indigo-500 to-purple-600',
        textClass: 'text-indigo-600',
        badgeClass: 'bg-indigo-50 text-indigo-600',
      }
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Thông Tin Học Bổng"
        subtitle="Tra cứu điều kiện, kết quả xét thưởng học bổng khuyến khích học tập"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Học bổng của tôi' }]}
        extra={
          <Select
            className="w-48"
            placeholder="Chọn học kỳ"
            value={selectedSemester}
            onChange={setSelectedSemester}
          >
            {semesters.map((sem) => (
              <Option key={sem.id} value={sem.id}>
                {sem.name}
              </Option>
            ))}
          </Select>
        }
      />

      {loading ? (
        <div className="flex h-64 justify-center items-center">
          <Spin size="large" />
        </div>
      ) : candidate ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {candidate.isEligible && candidate.scholarshipTier !== 'NONE' && tierInfo ? (() => {
            const scoreObj = (candidate as any).user?.semesterScores?.[0];
            const rawGpa = scoreObj?.gpa ?? 0;
            const rawConduct = scoreObj?.conductScore ?? 0;
            return (
              // Premium Gradient Certificate Card
              <Card className="border border-slate-100 rounded-2xl shadow-xl overflow-hidden bg-white p-0 relative">
                {/* Decorative Gradient Top border */}
                <div className={`h-3 bg-gradient-to-r ${tierInfo.gradient}`} />
                
                <div className="p-8 text-center space-y-6">
                  <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-tr ${tierInfo.gradient} flex items-center justify-center text-white text-4xl shadow-md`}>
                    <StarOutlined />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Chúc mừng sinh viên</span>
                    <h2 className="text-xl font-bold text-slate-800">{(candidate as any).user?.fullName || 'Sinh Viên'}</h2>
                    <span className="text-xs font-semibold text-slate-400 font-mono">MSSV: {(candidate as any).user?.studentCode || candidate.studentCode}</span>
                  </div>

                  <div className="py-5 px-6 border-y border-dashed border-slate-100 space-y-1.5">
                    <h1 className={`text-2xl font-black bg-gradient-to-r ${tierInfo.gradient} bg-clip-text text-transparent uppercase`}>
                      {tierInfo.label}
                    </h1>
                    <p className="text-[11px] italic font-semibold text-slate-400 uppercase tracking-wider">
                      {tierInfo.subLabel}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center py-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">GPA Gốc</span>
                      <strong className="text-base text-slate-700">{rawGpa.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">GPA Quy Đổi</span>
                      <strong className="text-base text-slate-700">{candidate.extendedGpa.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">Điểm Rèn Luyện</span>
                      <strong className="text-base text-slate-700">{rawConduct}</strong>
                    </div>
                  </div>

                  <Alert
                    message={<span className="font-semibold text-xs">{candidate.note || 'Bạn đã đạt điều kiện nhận học bổng'}</span>}
                    type="success"
                    showIcon
                    className="border-emerald-100 rounded-xl bg-emerald-50 text-left text-emerald-800"
                  />

                  <p className="text-[10px] text-slate-400">
                    * Quyết định cấp học bổng khuyến khích học tập dựa trên kết quả cuối cùng tại hội đồng xét tuyển trường.
                  </p>
                </div>
              </Card>
            );
          })() : (
            // Ineligible / NONE tier status card
            <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl">
                  <InfoCircleOutlined />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Kết Quả Đánh Giá Học Kỳ</h3>
                  <p className="text-xs text-slate-400">Bảng kết quả học bổng cá nhân chính thức</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Trạng Thái Đủ Điều Kiện:</span>
                  <Tag color="error" className="font-bold rounded-full px-2">Không đạt</Tag>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Mức Học Bổng Xét Duyệt:</span>
                  <strong className="text-slate-700 text-sm">Không có (NONE)</strong>
                </div>

                <Alert
                  message={<span className="font-semibold text-xs">Lý do chưa đạt: {candidate.note || 'Chưa tích luỹ đủ điểm rèn luyện hoặc GPA tối thiểu để nhận học bổng.'}</span>}
                  type="warning"
                  showIcon
                  className="border-amber-100 rounded-xl bg-amber-50 text-amber-800 text-left"
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                * Học bổng xét tuyển chỉ được kích hoạt nếu điểm GPA quy đổi sau khi cộng mở rộng đạt từ Khá trở lên (thang 4.0 từ 2.5 trở lên) và xếp loại rèn luyện đạt từ Khá trở lên (thang 100 từ 70 trở lên).
              </p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border border-slate-100 rounded-xl shadow-sm">
          <Result
            status="info"
            title="Chưa chạy xét học bổng học kỳ này"
            subTitle="Hệ thống chưa ghi nhận lượt chạy xét duyệt học bổng của Giáo vụ cho học kỳ được chọn. Vui lòng chờ phê duyệt hoặc liên hệ văn phòng khoa."
          />
        </Card>
      )}
    </div>
  );
};

export default MyScholarshipPage;
