import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { CalendarOutlined } from '@ant-design/icons';

export const SemesterListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Học Kỳ"
        subtitle="Quản lý thời gian bắt đầu, kết thúc của các năm học"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Học kỳ' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<CalendarOutlined className="text-purple-500 text-5xl" />}
          title="Tính năng Quản lý Học kỳ đang phát triển"
          subTitle="Module này sẽ hỗ trợ định cấu hình học kỳ hiện tại, thời gian ghi nhận thành tích của sinh viên."
        />
      </Card>
    </div>
  );
};
export default SemesterListPage;
