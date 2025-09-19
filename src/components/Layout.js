import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  if (isChatPage) {
    return (
      <div className="layout chat-layout">
        <Header />
        <main className="main-content chat-main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
