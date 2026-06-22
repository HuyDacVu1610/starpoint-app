import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { PercentageOutlined } from '@ant-design/icons';

export const BonusPointListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Điểm Thưởng"
        subtitle="Import điểm GPA, điểm rèn luyện và tính điểm GPA mở rộng tự động"
        breadcrumbs={[{ title: 'Nghiệp vụ' }, { title: 'Điểm thưởng' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<PercentageOutlined className="text-emerald-500 text-5xl" />}
          title="Tính năng Quản lý & Tính Điểm Thưởng đang phát triển"
          subTitle="Module này sẽ cho phép import file Excel kết quả học tập kỳ, tự động tính GPA mở rộng không cộng dồn từ điểm thưởng lớn nhất."
        />
      </Card>
    </div>
  );
};
export default BonusPointListPage;
