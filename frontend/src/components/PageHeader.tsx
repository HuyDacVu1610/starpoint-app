import { Typography } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const { Title, Paragraph } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, extra }: PageHeaderProps) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-200/60 dark:border-zinc-800">
      <div className="space-y-1">
        <Title 
          level={2} 
          style={{ 
            margin: 0, 
            fontWeight: 800, 
            color: isDark ? '#f4f4f5' : '#0f172a', 
            letterSpacing: '-0.02em' 
          }}
        >
          {title}
        </Title>
        {subtitle && (
          <Paragraph className="text-slate-500 dark:text-zinc-400 text-sm m-0">
            {subtitle}
          </Paragraph>
        )}
      </div>
      {extra && <div className="flex items-center gap-2 w-full sm:w-auto">{extra}</div>}
    </div>
  );
};
export default PageHeader;
