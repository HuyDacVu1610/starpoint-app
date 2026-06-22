import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { TrophyOutlined } from '@ant-design/icons';

export const AchievementListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Thành Tích"
        subtitle="Phê duyệt minh chứng thành tích và giải thưởng do sinh viên nộp lên"
        breadcrumbs={[{ title: 'Nghiệp vụ' }, { title: 'Thành tích' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<TrophyOutlined className="text-indigo-500 text-5xl" />}
          title="Tính năng Phê duyệt Thành tích đang phát triển"
          subTitle="Module này sẽ hỗ trợ ban giáo vụ duyệt các minh chứng nộp giải thưởng, tính điểm cộng cho sinh viên."
        />
      </Card>
    </div>
  );
};
export default AchievementListPage;
