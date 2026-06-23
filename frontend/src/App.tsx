import { useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';
import AppRouter from './routes/AppRouter';

function AppContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(logout());
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [dispatch, navigate]);

  return <AppRouter />;
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          colorPrimary: '#4f46e5',
          borderRadius: 12,
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
