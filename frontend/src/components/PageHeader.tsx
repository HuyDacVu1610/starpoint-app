import { Breadcrumb, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  extra?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, breadcrumbs, extra }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-200/60">
      <div className="space-y-1">
        <Breadcrumb className="text-xs text-slate-400 font-medium mb-1">
          {breadcrumbs.map((item, idx) => (
            <Breadcrumb.Item key={idx}>
              {item.path ? <Link to={item.path} className="hover:text-indigo-600 transition-colors">{item.title}</Link> : item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {title}
        </Title>
        {subtitle && <Paragraph className="text-slate-500 text-sm m-0">{subtitle}</Paragraph>}
      </div>
      {extra && <div className="flex items-center gap-2 w-full sm:w-auto">{extra}</div>}
    </div>
  );
};
export default PageHeader;
