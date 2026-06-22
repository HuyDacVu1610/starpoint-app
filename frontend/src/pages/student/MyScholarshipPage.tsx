import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { GiftOutlined } from '@ant-design/icons';

export const MyScholarshipPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trạng Thái Học Bổng"
        subtitle="Xem chi tiết kết quả xét học bổng khuyến khích học tập"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Học bổng của tôi' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<GiftOutlined className="text-rose-500 text-5xl" />}
          title="Kết quả Xét Học Bổng đang phát triển"
          subTitle="Hệ thống sẽ cập nhật trạng thái trúng tuyển học bổng của bạn và giải thích chi tiết xếp loại theo nguyên tắc xét tuyển."
        />
      </Card>
    </div>
  );
};
export default MyScholarshipPage;
