import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { UserOutlined } from '@ant-design/icons';

export const StudentListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Sinh Viên"
        subtitle="Quản lý tài khoản, mã sinh viên, thông tin lớp và vai trò"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Sinh viên' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<UserOutlined className="text-indigo-500 text-5xl" />}
          title="Tính năng Quản lý Sinh viên đang phát triển"
          subTitle="Module này sẽ hỗ trợ xem danh sách sinh viên, lọc lớp học, thêm tài khoản thủ công và nạp dữ liệu hàng loạt từ file Excel."
        />
      </Card>
    </div>
  );
};
export default StudentListPage;
