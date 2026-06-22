import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { FileProtectOutlined } from '@ant-design/icons';

export const MyAchievementsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thành Tích Của Tôi"
        subtitle="Theo dõi và nộp minh chứng các giải thưởng học thuật, phong trào cá nhân"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Thành tích cá nhân' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<FileProtectOutlined className="text-indigo-500 text-5xl" />}
          title="Minh chứng & Thành tích cá nhân đang phát triển"
          subTitle="Module này cho phép sinh viên tải lên tệp minh chứng cuộc thi (PDF/ảnh), chọn học kỳ để yêu cầu cộng điểm thưởng."
        />
      </Card>
    </div>
  );
};
export default MyAchievementsPage;
