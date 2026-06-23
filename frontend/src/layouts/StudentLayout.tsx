import { Layout, Menu, Avatar, Dropdown, App, Button, Breadcrumb } from 'antd';
import {
  TrophyOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';
import { toggleTheme } from '../features/theme/themeSlice';
import type { RootState } from '../store/store';
import { ScrollToTop } from '../components/ScrollToTop';
import { AppFooter } from '../components/AppFooter';

const { Header, Content } = Layout;


export const StudentLayout = () => {
  const { modal } = App.useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    ...pathnames.map((value, index) => {
      const url = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      let title: string = value;
      if (value === 'admin') title = 'Quản trị';
      else if (value === 'students') title = 'Sinh viên';
      else if (value === 'dashboard') title = 'Bảng điều khiển';
      else if (value === 'semesters') title = 'Học kỳ';
      else if (value === 'competitions') title = 'Cuộc thi';
      else if (value === 'achievements') title = 'Thành tích';
      else if (value === 'bonus-points') title = 'Điểm thưởng';
      else if (value === 'scholarships') title = 'Học bổng';
      else if (value === 'my') title = 'Cá nhân';
      if (title === value) {
        title = value.charAt(0).toUpperCase() + value.slice(1);
      }
      return {
        title: isLast ? <span>{title}</span> : <Link to={url}>{title}</Link>,
      };
    }),
  ];

  const handleLogout = () => {
    modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      okText: 'Đăng xuất',
      cancelText: 'Huỷ bỏ',
      okButtonProps: { danger: true, className: 'bg-red-600 hover:bg-red-700' },
      cancelButtonProps: { className: 'hover:border-slate-300' },
      onOk: () => {
        logout();
        navigate(ROUTES.LOGIN);
      },
    });
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: 'studentCode',
          label: <span className="text-slate-400 text-xs">MSSV: {user?.studentCode}</span>,
          disabled: true,
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          onClick: handleLogout,
        },
      ]}
    />
  );

  const menuItems = [
    {
      key: ROUTES.STUDENT_ACHIEVEMENTS,
      icon: <TrophyOutlined className="text-base" />,
      label: 'Thành tích của tôi',
    },
    {
      key: ROUTES.STUDENT_BONUS_POINTS,
      icon: <CalculatorOutlined className="text-base" />,
      label: 'Điểm thưởng & GPA',
    },
    {
      key: ROUTES.STUDENT_SCHOLARSHIP,
      icon: <SafetyCertificateOutlined className="text-base" />,
      label: 'Học bổng',
    },
  ];

  return (
    <Layout className="bg-slate-50 dark:bg-zinc-950 flex flex-col" style={{ minHeight: '100vh' }}>
      <Header
        style={{ background: isDark ? '#141414' : '#ffffff', padding: '0 24px' }}
        className="border-b border-slate-200/60 dark:border-zinc-800 h-16 flex justify-between items-center sticky top-0 z-10 shadow-sm"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              SP
            </div>
            <span className="font-extrabold text-slate-800 dark:text-zinc-100 text-lg tracking-tight select-none">
              StarPoint<span className="text-indigo-600">App</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.key}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={isDark ? <SunOutlined className="text-yellow-500 text-lg" /> : <MoonOutlined className="text-slate-600 text-lg" />}
            onClick={() => dispatch(toggleTheme())}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          />
          <span className="text-slate-500 dark:text-zinc-400 text-sm hidden sm:inline-block">
            Mã sinh viên: <span className="font-semibold text-slate-800 dark:text-zinc-200">{user?.studentCode}</span>
          </span>
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
            <div className="cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 px-2 rounded-lg transition-colors">
              <Avatar style={{ backgroundColor: '#4f46e5', verticalAlign: 'middle' }} size="default">
                {user?.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold">{user?.fullName}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Sinh viên</span>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Mobile navigation */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-slate-200/50 dark:border-zinc-800 px-4 py-2.5 flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <Link
              key={item.key}
              to={item.key}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                isActive 
                  ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-indigo-600'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>





      <Content className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-grow">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
        <ScrollToTop />
      </Content>

      <AppFooter />
    </Layout>
  );
};
export default StudentLayout;
