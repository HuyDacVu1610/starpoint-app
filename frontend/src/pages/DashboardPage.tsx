import { Card, Row, Col, Table, Tag } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components/PageHeader';

export const DashboardPage = () => {
  const stats = [
    { title: 'Tổng Sinh Viên', value: 1254, icon: <UserOutlined />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Cuộc Thi Học Kỳ', value: 12, icon: <CalendarOutlined />, color: 'bg-purple-50 text-purple-600' },
    { title: 'Thành Tích Đã Duyệt', value: 85, icon: <TrophyOutlined />, color: 'bg-amber-50 text-amber-600' },
    { title: 'Học Bổng Đạt Chuẩn', value: 42, icon: <FileProtectOutlined />, color: 'bg-emerald-50 text-emerald-600' },
  ];

  const recentActivities = [
    { key: '1', time: '10:30 Hôm nay', user: 'SV001 - Nguyễn Văn Nam', action: 'Nộp minh chứng cuộc thi cấp Trung ương', status: 'PENDING' },
    { key: '2', time: '09:15 Hôm nay', user: 'Staff Giáo Vụ', action: 'Import bảng điểm GPA Học kỳ 1', status: 'SUCCESS' },
    { key: '3', time: 'Hôm qua', user: 'ADMIN001', action: 'Cập nhật phân quyền vai trò STAFF', status: 'SUCCESS' },
    { key: '4', time: 'Hôm qua', user: 'SV003 - Lê Hoàng Anh', action: 'Cập nhật mật khẩu cá nhân', status: 'SUCCESS' },
  ];

  const columns = [
    { title: 'Thời gian', dataIndex: 'time', key: 'time', width: 150 },
    { title: 'Người thực hiện', dataIndex: 'user', key: 'user', width: 220 },
    { title: 'Hành động', dataIndex: 'action', key: 'action' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'SUCCESS' ? 'success' : 'warning'}>
          {status === 'SUCCESS' ? 'Hoàn thành' : 'Đang xử lý'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bảng Điều Khiển"
        subtitle="Tổng quan số liệu thống kê và hoạt động gần đây của hệ thống"
        breadcrumbs={[{ title: 'Trang chủ' }, { title: 'Bảng điều khiển' }]}
      />

      <Row gutter={[16, 16]}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card hoverable className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                    <span className="text-emerald-500 text-xs font-semibold inline-flex items-center">
                      <ArrowUpOutlined className="mr-0.5" /> +12%
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<span className="font-extrabold text-slate-800 text-base">Hoạt Động Gần Đây</span>}
        className="border border-slate-100 rounded-xl shadow-sm overflow-hidden"
      >
        <Table
          dataSource={recentActivities}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{ x: 600 }}
          className="border-0"
        />
      </Card>
    </div>
  );
};
export default DashboardPage;
