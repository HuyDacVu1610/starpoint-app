import { Tag } from 'antd';

interface BonusPointBadgeProps {
  points: number;
}

export const BonusPointBadge = ({ points }: BonusPointBadgeProps) => {
  const safePoints = points || 0;
  let color = 'default';
  let className = 'font-bold px-2 py-0.5 rounded-full';

  if (safePoints >= 0.4) {
    color = 'emerald';
  } else if (safePoints >= 0.2) {
    color = 'blue';
  } else if (safePoints > 0) {
    color = 'purple';
  }

  // Ant Design v5 tag colors custom support: if it's custom, we use styling or predefined tag color
  const colorMap: Record<string, string> = {
    emerald: 'success',
    blue: 'processing',
    purple: 'purple',
    default: 'default',
  };

  return (
    <Tag color={colorMap[color]} className={className}>
      +{safePoints.toFixed(2)}
    </Tag>
  );
};

export default BonusPointBadge;
