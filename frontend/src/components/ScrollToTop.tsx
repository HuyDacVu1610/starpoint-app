import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.scrollTop > 300) {
        setVisible(true);
      } else if (window.scrollY > 300) {
        setVisible(true);
      } else {
        // Also check if any scrollable divs are scrolled
        let anyScrolled = false;
        document.querySelectorAll('.overflow-y-auto').forEach((el) => {
          if (el.scrollTop > 300) {
            anyScrolled = true;
          }
        });
        setVisible(anyScrolled);
      }
    };

    // Use capture: true to catch scrolls on nested divs
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    document.querySelectorAll('.overflow-y-auto').forEach((el) => {
      el.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  };

  if (!visible) return null;

  return (
    <Button
      type="primary"
      shape="circle"
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        width: 45,
        height: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="bg-indigo-600 hover:bg-indigo-700 border-none transition-all duration-300 transform hover:scale-110"
    />
  );
};
export default ScrollToTop;
