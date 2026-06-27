import { useState, useEffect } from 'react';
import { Table, Button, Card, Select, Input, Tag, Row, Col, message } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import { scholarshipsService } from '../../services/scholarships.service';
import type { ScholarshipCandidate } from '../../services/scholarships.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';
import * as XLSX from 'xlsx';

const { Option } = Select;

const TIER_MAP: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: 'Xuất Sắc', color: 'red' },
  GOOD: { label: 'Giỏi', color: 'orange' },
  FAIR: { label: 'Khá', color: 'blue' },
  NONE: { label: 'Không Đạt', color: 'default' },
};

export const ScholarshipListPage = () => {
  const [data, setData] = useState<ScholarshipCandidate[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  


  // Filters State
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedTier, setSelectedTier] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'NONE' | undefined>(undefined);
  const [selectedEligible, setSelectedEligible] = useState<boolean | undefined>(undefined);

  const fetchSemesters = async () => {
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setSemesters(semesterList);
        if (semesterList.length > 0 && !selectedSemester) {
          setSelectedSemester(semesterList[0].id);
        }
      }
    } catch (err) {
      console.error('Error semesters list:', err);
    }
  };

  const fetchCandidates = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    try {
      const res = await scholarshipsService.listCandidates({
        search: search || undefined,
        semesterId: selectedSemester,
        scholarshipTier: selectedTier,
        isEligible: selectedEligible,
        limit: 200,
      });
      if (res.success && res.data) {
        const candidateList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(candidateList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách ứng viên học bổng');
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
    fetchCandidates();
  }, [search, selectedSemester, selectedTier, selectedEligible]);



  const handleExportExcel = () => {
    if (data.length === 0) {
      message.warning('Không có dữ liệu ứng viên học bổng để xuất Excel');
      return;
    }

    const exportData = data.map((item) => {
      const tierObj = TIER_MAP[item.scholarshipTier] || { label: item.scholarshipTier };
      const u = item.user as any;
      return {
        'Mã Sinh Viên': item.studentCode || u?.studentCode || '',
        'Họ và Tên': u?.fullName || '',
        'Học Kỳ': item.semester?.name || '',
        'GPA Học Kỳ': item.gpa,
        'Điểm Rèn Luyện': item.conductScore,
        'GPA Quy Đổi': item.extendedGpa,
        'Đạt Học Bổng': item.isEligible ? 'Đạt chuẩn' : 'Không đạt',
        'Loại Học Bổng': tierObj.label,
        'Ghi chú lý do': item.note || '',
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    // Auto-fit columns
    const max_len = exportData.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const val = row[key as keyof typeof row];
        const cellLength = val ? String(val).length : 0;
        acc[key] = Math.max(acc[key] || 0, cellLength, key.length);
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(max_len).map((key) => ({
      wch: max_len[key] + 3,
    }));

    const semesterName = semesters.find((s) => s.id === selectedSemester)?.name || `id_${selectedSemester}`;
    XLSX.writeFile(workbook, `Danh_Sach_Hoc_Bong_Ky_${semesterName.replace(/\s+/g, '_')}.xlsx`);
    message.success('Tải xuống danh sách Excel thành công!');
  };

  const columns = [
    {
      title: 'Mã Sinh Viên',
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
      title: 'GPA Quy Đổi',
      dataIndex: 'extendedGpa',
      key: 'extendedGpa',
      className: 'font-extrabold text-indigo-600',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Xếp Loại Học Bổng',
      dataIndex: 'scholarshipTier',
      key: 'scholarshipTier',
      render: (tier: string) => {
        const tierObj = TIER_MAP[tier] || { label: tier, color: 'default' };
        return <Tag color={tierObj.color} className="font-bold">{tierObj.label}</Tag>;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isEligible',
      key: 'isEligible',
      render: (eligible: boolean) => (
        <Tag color={eligible ? 'success' : 'error'} className="font-semibold px-2 py-0.5 rounded-full">
          {eligible ? 'Đủ điều kiện' : 'Không đạt'}
        </Tag>
      ),
    },
    {
      title: 'Ghi Chú Đánh Giá',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string) => <span className="text-xs text-slate-500 font-medium">{note || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh Sách Ứng Viên Học Bổng"
        subtitle="Quản lý, tổng hợp sinh viên đạt điều kiện học bổng khuyến khích học tập"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Ứng viên học bổng' }]}
      />

      <Card className="border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Input
              placeholder="Mã SV hoặc Họ tên..."
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
          </Col>
          <Col xs={24} sm={6}>
            <Select
              className="w-full"
              placeholder="Lọc Xếp loại"
              allowClear
              value={selectedTier}
              onChange={setSelectedTier}
            >
              <Option value="EXCELLENT">Xuất Sắc</Option>
              <Option value="GOOD">Giỏi</Option>
              <Option value="FAIR">Khá</Option>
              <Option value="NONE">Không nhận</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              className="w-full"
              placeholder="Lọc đủ điều kiện"
              allowClear
              value={selectedEligible}
              onChange={setSelectedEligible}
            >
              <Option value={true}>Đủ điều kiện</Option>
              <Option value={false}>Không đạt chuẩn</Option>
            </Select>
          </Col>
        </Row>

        {/* Excel Export Button Placed Directly Above Table */}
        <div className="flex justify-end mb-4">
          <Button
            type="primary"
            ghost
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            className="border-emerald-500 text-emerald-600 hover:border-emerald-600 hover:text-emerald-700 rounded-lg flex items-center gap-1.5"
          >
            Xuất File Excel
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 950 }}
        />
      </Card>


    </div>
  );
};

export default ScholarshipListPage;
