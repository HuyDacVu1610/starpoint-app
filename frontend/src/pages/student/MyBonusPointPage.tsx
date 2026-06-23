import { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Result, Spin, message, Progress } from 'antd';
import { TrophyOutlined, PercentageOutlined, StarOutlined } from '@ant-design/icons';
import { scoresService } from '../../services/scores.service';
import type { Score } from '../../services/scores.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';

const { Option } = Select;

const GRADE_MAP: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: 'Xuất Sắc', color: 'text-rose-600 bg-rose-50 border-rose-100' },
  GOOD: { label: 'Giỏi', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  FAIR: { label: 'Khá', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  AVERAGE: { label: 'Trung Bình', color: 'text-slate-600 bg-slate-50 border-slate-100' },
  WEAK: { label: 'Yếu', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  POOR: { label: 'Kém', color: 'text-red-600 bg-red-50 border-red-100' },
};

export const MyBonusPointPage = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSemesters = async () => {
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setSemesters(semesterList);
        if (semesterList.length > 0) {
          setSelectedSemester(semesterList[0].id);
        }
      }
    } catch (err) {
      console.error('Error semesters list:', err);
    }
  };

  const fetchMyScore = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    setScore(null);
    try {
      const res = await scoresService.listMy({ semesterId: selectedSemester });
      if (res.success && res.data) {
        const scoreList: Score[] = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        if (scoreList.length > 0) {
          setScore(scoreList[0]);
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi tải thông tin điểm học kỳ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchMyScore();
  }, [selectedSemester]);

  const renderGradeBadge = (gradeStr?: string) => {
    if (!gradeStr) return null;
    const gradeObj = GRADE_MAP[gradeStr] || { label: gradeStr, color: 'text-slate-600 bg-slate-50' };
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${gradeObj.color}`}>
        {gradeObj.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Kết Quả Học Tập & Điểm Cộng"
        subtitle="Xem chi tiết điểm GPA, điểm cộng thành tích và kết quả rèn luyện của bạn"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Điểm số & Rèn luyện' }]}
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
      ) : score ? (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            {/* GPA Card */}
            <Col xs={24} md={8}>
              <Card className="border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-slate-400">GPA Học Kỳ</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <PercentageOutlined className="text-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-slate-800">
                    {score.gpa.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Xếp loại học tập:</span>
                    {renderGradeBadge((score as any).gpaGrade)}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Achievements Bonus Point */}
            <Col xs={24} md={8}>
              <Card className="border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-slate-400">Điểm Cộng Thành Tích</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <TrophyOutlined className="text-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-amber-500">
                    +{score.bonusPoint.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Cộng từ các hoạt động/cuộc thi đã được phê duyệt
                  </div>
                </div>
              </Card>
            </Col>

            {/* Extended GPA */}
            <Col xs={24} md={8}>
              <Card className="border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-indigo-600 text-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-indigo-200">GPA Quy Đổi Xét Học Bổng</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <StarOutlined className="text-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black">
                    {score.extendedGpa.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-100 font-medium">
                    Bằng GPA gốc + Điểm cộng mở rộng (Tối đa 4.0)
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Conduct Score Detail */}
            <Col xs={24} md={16}>
              <Card
                title={<span className="font-extrabold text-slate-800 text-base">Chi Tiết Kết Quả Rèn Luyện</span>}
                className="border border-slate-100 rounded-2xl shadow-sm bg-white"
              >
                <Row gutter={[24, 24]} className="items-center">
                  <Col xs={24} sm={8} className="text-center">
                    <Progress
                      type="dashboard"
                      percent={score.conductScore}
                      strokeColor={{
                        '0%': '#87d068',
                        '100%': '#108ee9',
                      }}
                      width={140}
                    />
                  </Col>
                  <Col xs={24} sm={16} className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Điểm Rèn Luyện Đạt Được</span>
                      <strong className="text-3xl text-slate-800 font-extrabold">{score.conductScore} / 100</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Xếp Loại Rèn Luyện</span>
                      {renderGradeBadge((score as any).conductGrade)}
                    </div>
                    <p className="text-slate-400 text-xs">
                      * Kết quả rèn luyện do Khoa/Lớp tổng hợp phê duyệt chính thức được Giáo vụ nạp lên hệ thống.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Summary details */}
            <Col xs={24} md={8}>
              <Card
                title={<span className="font-extrabold text-slate-800 text-base">Ghi Chú Đổi Điểm</span>}
                className="border border-slate-100 rounded-2xl shadow-sm bg-white"
              >
                <div className="space-y-3.5 text-xs text-slate-500 font-medium">
                  <div className="flex justify-between pb-2.5 border-b border-slate-100">
                    <span>GPA ban đầu:</span>
                    <strong className="text-slate-700">{score.gpa.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pb-2.5 border-b border-slate-100">
                    <span>Điểm thưởng thành tích:</span>
                    <strong className="text-emerald-600">+{score.bonusPoint.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pb-2.5 border-b border-slate-100">
                    <span>Điểm quy đổi cuối cùng:</span>
                    <strong className="text-indigo-600">{score.extendedGpa.toFixed(2)}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                    * Điểm quy đổi cuối cùng được sử dụng để xét thưởng các danh hiệu, học bổng khuyến khích học tập tại hội đồng xét tuyển.
                  </p>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <Card className="border border-slate-100 rounded-xl shadow-sm">
          <Result
            status="info"
            title="Chưa có dữ liệu học tập"
            subTitle="Bảng điểm học tập và điểm rèn luyện của bạn cho học kỳ này chưa được nạp. Vui lòng liên hệ văn phòng khoa để được cập nhật."
          />
        </Card>
      )}
    </div>
  );
};

export default MyBonusPointPage;
