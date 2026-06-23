import { useState, useEffect } from 'react';
import { Button, Card, Modal, Form, Input, InputNumber, Select, Alert, Tooltip, App, Row, Col } from 'antd';
import { SearchOutlined, EditOutlined, FileExcelOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { scoresService } from '../../services/scores.service';
import type { Score } from '../../services/scores.service';
import { semestersService } from '../../services/semesters.service';
import type { Semester } from '../../services/semesters.service';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import DataTable from '../../components/DataTable';
import FileUploader from '../../components/FileUploader';
import GradeTag from '../../components/GradeTag';
import BonusPointBadge from '../../components/BonusPointBadge';

const { Option } = Select;

export const BonusPointListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Score[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [calculateLoading, setCalculateLoading] = useState(false);
  
  // Selected student for quick patch
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);

  // Import State
  const [importSemesterId, setImportSemesterId] = useState<number | undefined>(undefined);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);

  const [editForm] = Form.useForm();
  const canManage = hasPermission('MANAGE_BONUS');

  const fetchSemesters = async () => {
    try {
      const res = await semestersService.list({ limit: 100 });
      if (res.success && res.data) {
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setSemesters(semesterList);
        
        // Auto select current or first semester if none selected
        if (semesterList.length > 0 && !selectedSemester) {
          setSelectedSemester(semesterList[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchScores = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    try {
      const res = await scoresService.list({
        search: search || undefined,
        semesterId: selectedSemester,
        limit: 200,
      });
      if (res.success && res.data) {
        const scoreList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setData(scoreList);
      } else {
        message.error(res.message || 'Lỗi tải danh sách điểm số');
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
    fetchScores();
  }, [search, selectedSemester]);

  const handleOpenEdit = (record: Score) => {
    setSelectedScore(record);
    editForm.setFieldsValue({
      gpa: record.gpa,
      conductScore: record.conductScore,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedScore) return;
    try {
      const values = await editForm.validateFields();
      const res = await scoresService.updateManualScore(
        selectedScore.semesterId,
        selectedScore.studentCode,
        values
      );

      if (res.success) {
        message.success('Cập nhật điểm thành công');
        setIsEditModalOpen(false);
        fetchScores();
      } else {
        message.error(res.message || 'Lỗi cập nhật điểm số');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleImportSubmit = async () => {
    if (!importSemesterId) {
      message.warning('Vui lòng chọn học kỳ nhập điểm');
      return;
    }
    if (!importFile) {
      message.warning('Vui lòng chọn file điểm Excel (.xlsx hoặc .xls)');
      return;
    }

    setImportLoading(true);
    setImportErrors([]);
    try {
      const res = await scoresService.import(importSemesterId, importFile);
      if (res.success) {
        message.success('Nhập dữ liệu điểm từ Excel thành công');
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchScores();
      } else {
        message.error(res.message || 'Import thất bại');
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData) {
        const errorMsg = responseData.message;
        if (Array.isArray(errorMsg)) {
          setImportErrors(errorMsg);
        } else if (typeof errorMsg === 'string') {
          setImportErrors([errorMsg]);
        } else {
          setImportErrors(['Lỗi không xác định khi tải dữ liệu Excel']);
        }
      } else {
        setImportErrors(['Không thể kết nối đến máy chủ']);
      }
      message.error('Nhập dữ liệu Excel có lỗi. Xem chi tiết bên dưới.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleCalculateScores = async () => {
    if (!selectedSemester) {
      message.warning('Vui lòng chọn học kỳ');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận tính điểm thưởng học kỳ?',
      content: 'Hệ thống sẽ quét và cập nhật lại điểm cộng thưởng lớn nhất (max bonus) cũng như điểm GPA sau quy đổi cho toàn bộ sinh viên trong học kỳ này.',
      okText: 'Tính điểm',
      cancelText: 'Huỷ',
      okButtonProps: { className: 'bg-indigo-600 hover:bg-indigo-700' },
      onOk: async () => {
        setCalculateLoading(true);
        try {
          const res = await scoresService.calculate(selectedSemester);
          if (res.success) {
            message.success(res.message || 'Tính điểm thưởng thành công!');
            fetchScores();
          } else {
            message.error(res.message || 'Lỗi tính toán điểm thưởng');
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tính điểm');
        } finally {
          setCalculateLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã Sinh Viên',
      dataIndex: 'studentCode',
      key: 'studentCode',
      className: 'font-semibold text-slate-700',
    },
    {
      title: 'Họ và Tên',
      dataIndex: ['user', 'fullName'],
      key: 'fullName',
    },
    {
      title: 'GPA Học Kỳ',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Điểm Cộng Thêm',
      dataIndex: 'bonusPoint',
      key: 'bonusPoint',
      render: (val: number) => <BonusPointBadge points={val} />,
    },
    {
      title: 'GPA Sau Quy Đổi',
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
      className: 'font-semibold text-slate-700',
    },
    {
      title: 'Xếp Loại RL',
      dataIndex: 'conductGrade',
      key: 'conductGrade',
      render: (grade: string) => <GradeTag grade={grade} />,
    },
    ...(canManage
      ? [
          {
            title: 'Hành Động',
            key: 'action',
            width: 100,
            render: (_: any, record: Score) => (
              <Tooltip title="Cập nhật nhanh điểm số">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-indigo-500 hover:scale-115 transition-transform text-base" />}
                  onClick={() => handleOpenEdit(record)}
                />
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Điểm Số & ĐRL"
        subtitle="Tra cứu bảng điểm, điểm rèn luyện, tính điểm cộng mở rộng gpa học tập"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Quản lý điểm số' }]}
        extra={
          canManage && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                icon={<ThunderboltOutlined />}
                loading={calculateLoading}
                onClick={handleCalculateScores}
                className="bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-lg shadow-sm font-semibold flex items-center gap-1.5"
              >
                Tính Điểm Thưởng
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => {
                  setImportErrors([]);
                  setImportFile(null);
                  setIsImportModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg shadow-sm flex items-center gap-1.5 font-semibold"
              >
                Nhập Điểm Từ Excel
              </Button>
            </div>
          )
        }
      />

      <Card className="border border-slate-100 rounded-xl shadow-sm bg-white/80 backdrop-blur-md">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={10}>
            <Input
              placeholder="Tìm theo Mã SV hoặc Họ tên..."
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
              placeholder="Chọn học kỳ hiển thị"
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
        </Row>

        <DataTable
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pageSize={15}
          rowClassName={(record: Score) => {
            const isEligible = record.extendedGpa >= 2.5 && record.conductScore >= 70;
            return isEligible 
              ? 'bg-emerald-50/30 hover:bg-emerald-100/40 transition-colors font-medium' 
              : 'hover:bg-slate-50/50 transition-colors';
          }}
        />
      </Card>

      {/* Manual Quick Patch Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-extrabold text-base">Cập Nhật Điểm Sinh Viên</span>
            {selectedScore && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {selectedScore.studentCode}
              </span>
            )}
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Huỷ"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700' }}
        destroyOnClose
      >
        {selectedScore && (
          <div className="mb-4 text-xs text-slate-500">
            Họ tên: <strong className="text-slate-700">{(selectedScore.user as any)?.fullName}</strong>
          </div>
        )}
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="gpa"
            label="Điểm GPA Học Kỳ (Thang 4)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm GPA' },
              {
                validator: (_, value) => {
                  if (value === undefined || (value >= 0 && value <= 4)) return Promise.resolve();
                  return Promise.reject(new Error('GPA phải nằm trong khoảng [0.0, 4.0]'));
                },
              },
            ]}
          >
            <InputNumber step={0.01} min={0} max={4} className="w-full" placeholder="Ví dụ: 3.52" />
          </Form.Item>

          <Form.Item
            name="conductScore"
            label="Điểm Rèn Luyện (Thang 100)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm rèn luyện' },
              {
                validator: (_, value) => {
                  if (value === undefined || (Number.isInteger(value) && value >= 0 && value <= 100)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Điểm rèn luyện phải là số nguyên trong khoảng [0, 100]'));
                },
              },
            ]}
          >
            <InputNumber step={1} min={0} max={100} className="w-full" placeholder="Ví dụ: 85" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        title="Nhập Bảng Điểm Hàng Loạt Từ Excel"
        open={isImportModalOpen}
        onOk={handleImportSubmit}
        onCancel={() => {
          if (!importLoading) setIsImportModalOpen(false);
        }}
        okText="Bắt đầu nạp"
        cancelText="Đóng"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700', loading: importLoading }}
        destroyOnClose
        width={650}
      >
        <div className="mt-4 space-y-4">
          <Form layout="vertical">
            <Form.Item label="Chọn học kỳ nạp điểm" required>
              <Select
                placeholder="Chọn học kỳ..."
                value={importSemesterId}
                onChange={setImportSemesterId}
                className="w-full"
              >
                {semesters.map((sem) => (
                  <Option key={sem.id} value={sem.id}>
                    {sem.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tải lên file Excel chứa điểm GPA và Điểm rèn luyện" required>
              <FileUploader
                onFileSelect={setImportFile}
                selectedFile={importFile}
              />
            </Form.Item>
          </Form>

          {/* Row-level scrollable Alert box for failures */}
          {importErrors.length > 0 && (
            <Alert
              message={<span className="font-bold">Nhập dữ liệu Excel không thành công</span>}
              description={
                <div className="max-h-48 overflow-y-auto mt-2 pr-2">
                  <ul className="list-disc pl-4 space-y-1.5 text-xs font-medium text-red-700">
                    {importErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              }
              type="error"
              showIcon
              className="border border-red-200 rounded-xl"
            />
          )}

          <div className="text-slate-400 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-600 mb-1">Quy tắc định dạng file Excel nhập điểm:</h4>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>File phải có tiêu đề ở dòng đầu tiên.</li>
              <li>Chứa các cột bắt buộc: <strong className="text-slate-600">Mã sinh viên (MSSV)</strong>, <strong className="text-slate-600">Điểm GPA</strong> (thang 4), <strong className="text-slate-600">Điểm rèn luyện</strong> (thang 100).</li>
              <li>Hệ thống tự động dò tìm các cột tương đương (ví dụ: "diem trung binh", "drl", "mssv").</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BonusPointListPage;
