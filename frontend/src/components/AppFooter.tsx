import { Layout } from 'antd';

const { Footer } = Layout;

export const AppFooter = () => {
  return (
    <Footer className="text-center text-slate-400 dark:text-zinc-500 text-xs py-6 bg-transparent border-t border-slate-100/50 dark:border-zinc-800/50 mt-auto">
      © 2026 Hệ thống Quản lý Điểm thưởng & Học bổng Sinh viên.
    </Footer>
  );
};

export default AppFooter;
