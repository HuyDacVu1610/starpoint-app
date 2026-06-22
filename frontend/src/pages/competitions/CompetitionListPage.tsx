import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { AppstoreAddOutlined } from '@ant-design/icons';

export const CompetitionListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Cuộc Thi"
        subtitle="Theo dõi và phân loại các giải đấu học thuật và hoạt động phong trào"
        breadcrumbs={[{ title: 'Quản trị' }, { title: 'Cuộc thi' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<AppstoreAddOutlined className="text-amber-500 text-5xl" />}
          title="Tính năng Quản lý Cuộc thi đang phát triển"
          subTitle="Module này sẽ cho phép định cấu hình cuộc thi cấp Học viện hoặc Trung ương và gán mức điểm thưởng tương ứng."
        />
      </Card>
    </div>
  );
};
export default CompetitionListPage;
