import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { TrophyOutlined } from '@ant-design/icons';

export const ScholarshipListPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Xét Duyệt Học Bổng"
        subtitle="Áp dụng quy tắc Min-Matching xét tuyển sinh viên đạt chuẩn nhận học bổng KKHT"
        breadcrumbs={[{ title: 'Nghiệp vụ' }, { title: 'Học bổng' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<TrophyOutlined className="text-rose-500 text-5xl" />}
          title="Tính năng Xét Học Bổng đang phát triển"
          subTitle="Module này áp dụng lọc ngưỡng tối thiểu loại Khá cho cả GPA mở rộng và Điểm rèn luyện để sinh danh sách ứng viên nhận học bổng."
        />
      </Card>
    </div>
  );
};
export default ScholarshipListPage;
