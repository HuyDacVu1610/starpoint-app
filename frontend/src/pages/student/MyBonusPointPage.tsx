import { Card, Result } from 'antd';
import { PageHeader } from '../../components/PageHeader';
import { AreaChartOutlined } from '@ant-design/icons';

export const MyBonusPointPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Điểm Thưởng & GPA Mở Rộng"
        subtitle="Xem chi tiết kết quả học tập, điểm rèn luyện và GPA mở rộng tích luỹ"
        breadcrumbs={[{ title: 'Sinh viên' }, { title: 'Điểm cộng tích luỹ' }]}
      />
      <Card className="border border-slate-100 rounded-xl shadow-sm">
        <Result
          icon={<AreaChartOutlined className="text-emerald-500 text-5xl" />}
          title="Xem Điểm & GPA mở rộng đang phát triển"
          subTitle="Hệ thống sẽ hiển thị điểm GPA gốc, điểm cộng từ thành tích lớn nhất của bạn trong kỳ và điểm rèn luyện đã được xếp loại."
        />
      </Card>
    </div>
  );
};
export default MyBonusPointPage;
