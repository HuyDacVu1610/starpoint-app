import { Tag } from 'antd';

interface GradeTagProps {
  grade?: string | null;
}

const GRADE_CONFIG_MAP: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: 'Xuất Sắc', color: 'success' },
  GOOD: { label: 'Giỏi', color: 'processing' },
  FAIR: { label: 'Khá', color: 'warning' },
  AVERAGE: { label: 'Trung Bình', color: 'default' },
  WEAK: { label: 'Yếu', color: 'error' },
  POOR: { label: 'Kém', color: 'error' },
  
  // Also support Vietnamese direct labels
  'XUẤT SẮC': { label: 'Xuất Sắc', color: 'success' },
  'GIỎI': { label: 'Giỏi', color: 'processing' },
  'KHÁ': { label: 'Khá', color: 'warning' },
  'TRUNG BÌNH': { label: 'Trung Bình', color: 'default' },
  'YẾU': { label: 'Yếu', color: 'error' },
  'KÉM': { label: 'Kém', color: 'error' },
};

export const GradeTag = ({ grade }: GradeTagProps) => {
  if (!grade) {
    return <span className="text-slate-400 font-medium text-xs">Chưa xếp loại</span>;
  }
  const normalized = grade.toUpperCase();
  const config = GRADE_CONFIG_MAP[normalized] || { label: grade, color: 'default' };

  return (
    <Tag color={config.color} className="font-bold uppercase text-[11px] px-2 py-0.5 rounded">
      {config.label}
    </Tag>
  );
};

export default GradeTag;
