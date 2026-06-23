import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, App, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  FlagOutlined,
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

const { Header, Sider, Content } = Layout;


export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { modal } = App.useApp();
  const { user, logout, hasPermission } = useAuth();
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

  // Generate menu items based on permissions
  const menuItems: Required<MenuProps>['items'] = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.ADMIN_DASHBOARD}>Bảng điều khiển</Link>,
    },
  ];

  if (hasPermission('VIEW_USER')) {
    menuItems.push({
      key: ROUTES.ADMIN_STUDENTS,
      icon: <UserOutlined />,
      label: <Link to={ROUTES.ADMIN_STUDENTS}>Quản lý Sinh viên</Link>,
    });
  }

  if (hasPermission('MANAGE_SEMESTER')) {
    menuItems.push({
      key: ROUTES.ADMIN_SEMESTERS,
      icon: <CalendarOutlined />,
      label: <Link to={ROUTES.ADMIN_SEMESTERS}>Quản lý Học kỳ</Link>,
    });
  }

  if (hasPermission('MANAGE_COMPETITION')) {
    menuItems.push({
      key: ROUTES.ADMIN_COMPETITIONS,
      icon: <FlagOutlined />,
      label: <Link to={ROUTES.ADMIN_COMPETITIONS}>Quản lý Cuộc thi</Link>,
    });
  }

  if (hasPermission('VIEW_ACHIEVEMENT')) {
    menuItems.push({
      key: ROUTES.ADMIN_ACHIEVEMENTS,
      icon: <TrophyOutlined />,
      label: <Link to={ROUTES.ADMIN_ACHIEVEMENTS}>Duyệt Thành tích</Link>,
    });
  }

  if (hasPermission('VIEW_BONUS')) {
    menuItems.push({
      key: ROUTES.ADMIN_BONUS_POINTS,
      icon: <CalculatorOutlined />,
      label: <Link to={ROUTES.ADMIN_BONUS_POINTS}>Quản lý Điểm thưởng</Link>,
    });
  }

  if (hasPermission('VIEW_SCHOLARSHIP')) {
    menuItems.push({
      key: ROUTES.ADMIN_SCHOLARSHIPS,
      icon: <SafetyCertificateOutlined />,
      label: <Link to={ROUTES.ADMIN_SCHOLARSHIPS}>Xét duyệt Học bổng</Link>,
    });
  }

  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        className="shadow-md border-r border-slate-800"
        width={250}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: '#0f172a',
        }}
      >
        <div className="h-16 flex items-center justify-center px-4 gap-2 overflow-hidden" style={{ background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
            SP
          </div>
          {!collapsed && (
            <span className="font-extrabold text-white text-lg tracking-tight select-none">
              StarPoint<span className="text-indigo-400">App</span>
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-0 pt-4"
          style={{ height: 'calc(100vh - 64px)', background: '#0f172a' }}
        />
      </Sider>
      
      <Layout className="bg-slate-50 dark:bg-zinc-950 flex flex-col" style={{ minHeight: '100vh' }}>
        <Header 
          style={{ background: isDark ? '#141414' : '#ffffff', padding: '0 24px' }}
          className="border-b border-slate-200/50 dark:border-zinc-800 h-16 flex justify-between items-center sticky top-0 z-10 shadow-sm"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-indigo-600 w-10 h-10 flex items-center justify-center rounded-lg"
          />

          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={isDark ? <SunOutlined className="text-yellow-500 text-lg" /> : <MoonOutlined className="text-slate-600 text-lg" />}
              onClick={() => dispatch(toggleTheme())}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            />
            <span className="text-slate-500 dark:text-zinc-400 text-sm hidden sm:inline-block">
              Xin chào, <span className="font-semibold text-slate-800 dark:text-zinc-200">{user?.fullName}</span>
            </span>
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <div className="cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 px-2 rounded-lg transition-colors">
                <Avatar style={{ backgroundColor: '#4f46e5', verticalAlign: 'middle' }} size="default">
                  {user?.fullName.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs text-slate-400 font-medium">{user?.roles[0]}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-6 md:p-8 bg-slate-50 dark:bg-zinc-950 overflow-y-auto flex-grow" style={{ minHeight: 280 }}>
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
          <ScrollToTop />
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
