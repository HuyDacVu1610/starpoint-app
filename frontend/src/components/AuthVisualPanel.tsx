import React from 'react';
import {
  StarFilled,
  DotChartOutlined,
  StarOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

interface AuthVisualPanelProps {
  title: React.ReactNode;
  subtitle: string;
}

export const AuthVisualPanel: React.FC<AuthVisualPanelProps> = ({ title, subtitle }) => {
  return (
    <div className="hidden md:flex md:w-[65%] p-16 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#3b82f6] to-[#0d9488] dark:from-[#0d091e] dark:via-[#0e0a24] dark:to-[#170e35] transition-all duration-300">
      <style>{`
        .dot-grid {
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
        .dark .dot-grid {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.2px, transparent 1.2px);
        }
      `}</style>

      {/* Dot pattern cover */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      {/* Ambient neon glows for dark mode */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px] pointer-events-none" />

      {/* Header section with brand */}
      <div className="z-10 flex flex-col space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl shadow-md">
            <StarOutlined />
          </div>
          <span className="text-xl font-extrabold text-white">Quản Lý Điểm Thưởng</span>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg text-xs text-white font-bold self-start mt-6 shadow-lg animate-bounce" style={{ animationDuration: '4.5s' }}>
          <StarFilled className="text-yellow-400 text-base animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">Giải Nhất</div>
            <div className="text-yellow-300 font-extrabold">+0.4 GPA</div>
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white leading-[1.2] max-w-lg">
          {title}
        </h1>

        <p className="text-slate-100/80 dark:text-slate-400/85 text-sm max-w-md leading-relaxed font-semibold">
          {subtitle}
        </p>
      </div>

      {/* Floating elements inside canvas */}
      <div className="absolute inset-0 pointer-events-none">
        {/* GPA Badge */}
        <div className="absolute top-[50%] left-[6%] animate-bounce px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg flex items-center gap-3 text-xs text-white font-bold shadow-lg" style={{ animationDuration: '4s' }}>
          <DotChartOutlined className="text-indigo-200 dark:text-indigo-400 text-base" />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">GPA</div>
            <div>3.92 / 4</div>
          </div>
        </div>

        {/* Programming Contest Badge */}
        <div className="absolute top-[32%] right-[10%] animate-bounce px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg flex items-center gap-3 text-xs text-white font-bold shadow-lg" style={{ animationDuration: '5s' }}>
          <StarOutlined className="text-cyan-300 dark:text-cyan-400 text-base" />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">Cuộc thi lập trình</div>
            <div>Top 3</div>
          </div>
        </div>

        {/* Scholarship Badge */}
        <div className="absolute top-[52%] right-[6%] animate-bounce px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg flex items-center gap-3 text-xs text-white font-bold shadow-lg" style={{ animationDuration: '6s' }}>
          <InfoCircleOutlined className="text-emerald-300 dark:text-emerald-400 text-base" />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">Học bổng</div>
            <div>Xét duyệt</div>
          </div>
        </div>

        {/* Bonus Points Badge */}
        <div className="absolute top-[65%] left-[8%] animate-bounce px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg flex items-center gap-3 text-xs text-white font-bold shadow-lg" style={{ animationDuration: '4.5s' }}>
          <StarOutlined className="text-rose-300 dark:text-rose-400 text-base animate-spin" style={{ animationDuration: '12s' }} />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">Điểm thưởng</div>
            <div>0.2 pts</div>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="absolute bottom-[23%] right-[14%] animate-bounce px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-lg flex items-center gap-3 text-xs text-white font-bold shadow-lg" style={{ animationDuration: '5.5s' }}>
          <ThunderboltOutlined className="text-yellow-300 dark:text-yellow-400 text-base" />
          <div>
            <div className="text-[10px] text-slate-200/75 dark:text-slate-400/75 font-normal">Hackathon</div>
            <div>Vô địch</div>
          </div>
        </div>
      </div>

      {/* Bottom statistics panel */}
      <div className="z-10 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-5">
          <div className="px-5 py-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-md">
            <div className="text-2xl font-black text-white">1, 240+</div>
            <div className="text-[10px] text-slate-100/70 dark:text-slate-400/75 mt-1 font-semibold">Sinh viên đã đăng ký</div>
          </div>
          <div className="px-5 py-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-md">
            <div className="text-2xl font-black text-white">320+</div>
            <div className="text-[10px] text-slate-100/70 dark:text-slate-400/75 mt-1 font-semibold">Cuộc thi được ghi nhận</div>
          </div>
          <div className="px-5 py-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] border border-white/15 backdrop-blur-md">
            <div className="text-2xl font-black text-white">185</div>
            <div className="text-[10px] text-slate-100/70 dark:text-slate-400/75 mt-1 font-semibold">Học bổng đã xét</div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-200/50 dark:text-slate-500/50 select-none font-bold">
          Hệ thống Quản lý Điểm thưởng & Xét Học bổng Khuyến khích Học tập
        </div>
      </div>
    </div>
  );
};
