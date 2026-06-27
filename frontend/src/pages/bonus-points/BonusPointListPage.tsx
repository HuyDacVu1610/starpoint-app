import { useState, useEffect } from 'react';
import { Button, Card, Modal, Form, Input, InputNumber, Select, Alert, Tooltip, App, Row, Col } from 'antd';
import { SearchOutlined, EditOutlined, FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
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
import { competitionsService } from '../../services/competitions.service';
import type { Competition } from '../../services/competitions.service';
import { usersService } from '../../services/users.service';

const { Option } = Select;

export const BonusPointListPage = () => {
  const { message } = App.useApp();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Score[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
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
        const semesterList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
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

  const fetchCompetitions = async (semesterId: number) => {
    try {
      const res = await competitionsService.list({ semesterId, limit: 100 });
      if (res.success && res.data) {
        const compList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
        setCompetitions(compList);
      }
    } catch (err) {
      console.error('Error fetching competitions:', err);
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
    if (selectedSemester) {
      fetchCompetitions(selectedSemester);
    }
  }, [search, selectedSemester]);

  const handleOpenAdd = () => {
    setSelectedScore(null);
    editForm.resetFields();
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (record: Score) => {
    setSelectedScore(record);
    editForm.setFieldsValue({
      studentCode: record.user?.studentCode || '',
      gpa: record.gpa,
      conductScore: record.conductScore,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedSemester) {
        message.error('Vui lòng chọn học kỳ');
        return;
      }

      const studentCode = selectedScore ? (selectedScore.user?.studentCode || selectedScore.studentCode) : values.studentCode;

      const compId = values.competitionId || null;
      let rank = null;
      let category = null;

      if (compId) {
        rank = values.rank || null;
      } else if (values.category) {
        category = values.category;
        rank = 'NONE';
      }

      const res = await scoresService.updateManualScore(
        selectedSemester,
        studentCode,
        {
          gpa: values.gpa,
          conductScore: values.conductScore,
          competitionId: compId,
          rank: rank,
          category: category,
        }
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
      title: 'GPA Học Kỳ',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (val: number) => (val !== undefined && val !== null ? val.toFixed(2) : '0.00'),
    },
    {
      title: 'Điểm Cộng Thêm',
      dataIndex: 'maxBonusPoint',
      key: 'maxBonusPoint',
      render: (val: number) => <BonusPointBadge points={val} />,
    },
    {
      title: 'GPA Sau Quy Đổi',
      dataIndex: 'extendedGpa',
      key: 'extendedGpa',
      className: 'font-extrabold text-indigo-600 dark:text-indigo-400',
      render: (val: number) => (val !== undefined && val !== null ? val.toFixed(2) : '0.00'),
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
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg shadow-sm flex items-center gap-1.5 font-semibold text-white"
              >
                Thêm Điểm Thủ Công
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

      <Card className="border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
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
              ? 'bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-100/40 dark:hover:bg-emerald-900/30 transition-colors font-medium text-emerald-800 dark:text-emerald-300' 
              : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors';
          }}
        />
      </Card>

      {/* Manual Quick Patch Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-extrabold text-base">
              {selectedScore ? 'Cập Nhật Điểm Sinh Viên' : 'Thêm Điểm Sinh Viên Mới'}
            </span>
            {selectedScore && (
              <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                {selectedScore.user?.studentCode || selectedScore.studentCode}
              </span>
            )}
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText={selectedScore ? 'Lưu thay đổi' : 'Thêm mới'}
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
          {!selectedScore && (
            <Form.Item
              name="studentCode"
              label="Mã Sinh Viên / MSSV"
              validateTrigger="onBlur"
              hasFeedback
              rules={[
                { required: true, message: 'Vui lòng nhập mã sinh viên' },
                { pattern: /^[A-Z0-9_-]+$/i, message: 'Mã sinh viên chỉ được chứa chữ cái, số, gạch ngang' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    const trimmed = value.trim();
                    try {
                      const res = await usersService.list({ search: trimmed, limit: 10 });
                      if (res.success && res.data) {
                        const items = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
                        const exists = items.some(
                          (item: any) => item.studentCode.toLowerCase() === trimmed.toLowerCase()
                        );
                        if (exists) {
                          return Promise.resolve();
                        }
                      }
                      return Promise.reject(new Error('Mã sinh viên không tồn tại trên hệ thống'));
                    } catch (err) {
                      return Promise.resolve();
                    }
                  }
                }
              ]}
            >
              <Input placeholder="Ví dụ: SV001..." />
            </Form.Item>
          )}
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

          <Form.Item
            name="competitionId"
            label="Đạt Giải Cuộc Thi (Tùy chọn)"
            extra="Liên kết thành tích cuộc thi trong học kỳ này để tự động tính điểm cộng rèn luyện."
          >
            <Select placeholder="Chọn cuộc thi..." allowClear>
              {competitions.map((comp) => (
                <Option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.level === 'CENTRAL' ? 'Cấp T.Ư' : 'Cấp Trường'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item noStyle dependencies={['competitionId']}>
            {({ getFieldValue }) => {
              const compId = getFieldValue('competitionId');
              if (compId) {
                return (
                  <Form.Item
                    name="rank"
                    label="Hạng Giải Thưởng"
                    rules={[{ required: true, message: 'Vui lòng chọn hạng giải thưởng khi đã liên kết cuộc thi' }]}
                  >
                    <Select placeholder="Chọn hạng giải..." allowClear>
                      <Option value="FIRST">Giải Nhất / HCV / Cúp Vàng</Option>
                      <Option value="SECOND">Giải Nhì / HCB / Cúp Bạc</Option>
                      <Option value="THIRD">Giải Ba / HCĐ / Cúp Đồng</Option>
                      <Option value="NONE">Tham Gia / Khác</Option>
                    </Select>
                  </Form.Item>
                );
              } else {
                return (
                  <Form.Item
                    name="category"
                    label="Loại Hoạt Động / Thành Tích (Tùy chọn)"
                    extra="Chọn loại hoạt động ngoài cuộc thi để cộng điểm thưởng rèn luyện mặc định (+0.1)."
                  >
                    <Select placeholder="Chọn loại hoạt động..." allowClear>
                      <Option value="ORGANIZATION_PARTICIPATION">Tham gia Ban tự quản / BCH / CLB / Ban phát thanh</Option>
                      <Option value="SPECIAL_ACHIEVEMENT">Thành tích đặc biệt khác</Option>
                    </Select>
                  </Form.Item>
                );
              }
            }}
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
              <li>Chứa các cột bắt buộc: <strong className="text-slate-600 dark:text-slate-300">Mã sinh viên (MSSV)</strong>, <strong className="text-slate-600 dark:text-slate-300">Điểm GPA</strong> (thang 4), <strong className="text-slate-600 dark:text-slate-300">Điểm rèn luyện</strong> (thang 100).</li>
              <li>Hỗ trợ 2 cột tùy chọn: <strong className="text-slate-600 dark:text-slate-300">Tên cuộc thi</strong> và <strong className="text-slate-600 dark:text-slate-300">Giải thưởng</strong> (Nhất, Nhì, Ba, Khuyến khích/Tham gia) để tự động nạp thành tích & tính điểm thưởng.</li>
              <li>Hệ thống tự động dò tìm các cột tương đương (ví dụ: "diem trung binh", "drl", "mssv").</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BonusPointListPage;
