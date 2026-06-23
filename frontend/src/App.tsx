import { useEffect } from 'react';
import { ConfigProvider, App as AntdApp, theme as AntdTheme } from 'antd';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice';
import AppRouter from './routes/AppRouter';
import type { RootState } from './store/store';

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
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? AntdTheme.darkAlgorithm : AntdTheme.defaultAlgorithm,
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
