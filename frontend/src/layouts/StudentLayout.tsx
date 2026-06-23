import { Layout, Menu, Avatar, Dropdown, App } from 'antd';
import {
  TrophyOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';

const { Header, Content, Footer } = Layout;

export const StudentLayout = () => {
  const { modal } = App.useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
      icon: <TrophyOutlined />,
      label: <Link to={ROUTES.STUDENT_ACHIEVEMENTS}>Thành tích của tôi</Link>,
    },
    {
      key: ROUTES.STUDENT_BONUS_POINTS,
      icon: <CalculatorOutlined />,
      label: <Link to={ROUTES.STUDENT_BONUS_POINTS}>Điểm thưởng & GPA</Link>,
    },
    {
      key: ROUTES.STUDENT_SCHOLARSHIP,
      icon: <SafetyCertificateOutlined />,
      label: <Link to={ROUTES.STUDENT_SCHOLARSHIP}>Học bổng</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen bg-slate-50/50">
      <Header className="bg-white border-b border-slate-200/50 h-16 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              SP
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight select-none">
              StarPoint<span className="text-indigo-600">App</span>
            </span>
          </div>
          
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-0 hidden md:flex font-medium"
            style={{ minWidth: 400 }}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm hidden sm:inline-block">
            Mã sinh viên: <span className="font-semibold text-slate-800">{user?.studentCode}</span>
          </span>
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
            <div className="cursor-pointer flex items-center gap-2 hover:bg-slate-50 p-1 px-2 rounded-lg transition-colors">
              <Avatar style={{ backgroundColor: '#4f46e5', verticalAlign: 'middle' }} size="default">
                {user?.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs text-slate-800 font-bold">{user?.fullName}</span>
                <span className="text-[10px] text-slate-400 font-medium">Sinh viên</span>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Mobile navigation */}
      <div className="md:hidden bg-white border-b border-slate-100 px-4">
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-0 flex justify-around w-full"
        />
      </div>

      <Content className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </Content>

      <Footer className="text-center text-slate-400 text-xs py-6 bg-transparent border-t border-slate-100">
        © 2026 StarPointApp. Hệ thống Quản lý Điểm thưởng & Học bổng Sinh viên.
      </Footer>
    </Layout>
  );
};
export default StudentLayout;
