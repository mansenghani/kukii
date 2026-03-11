import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import EventBooking from './pages/EventBooking';
import PreOrder from './pages/PreOrder';
import CancelBooking from './pages/CancelBooking';

import AdminDashboard from './pages/Admin/Dashboard';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const initialTheme = useMemo(() => {
    const stored = localStorage.getItem('kuki_theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const initialAdminTheme = useMemo(() => {
    const stored = localStorage.getItem('kuki_admin_theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark';
  }, []);

  const [theme, setTheme] = useState(initialTheme);
  const [adminTheme, setAdminTheme] = useState(initialAdminTheme);

  useEffect(() => {
    localStorage.setItem('kuki_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kuki_admin_theme', adminTheme);
  }, [adminTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isAdminRoute ? adminTheme : theme);
  }, [theme, adminTheme, isAdminRoute]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route path="/*" element={
          <>
            <Header theme={theme} onToggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/events" element={<EventBooking />} />
                <Route path="/preorder" element={<PreOrder />} />
                <Route path="/preorder/:id" element={<PreOrder />} />
                <Route path="/cancel-booking" element={<CancelBooking />} />

                <Route path="*" element={<div>Page Not Found</div>} />
              </Routes>
            </Header>
            <Footer />
          </>
        } />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={<AdminDashboard adminTheme={adminTheme} onToggleAdminTheme={toggleAdminTheme} />}
        />
        <Route element={<PrivateRoute />}>
          <Route
            path="/admin/:tab"
            element={<AdminDashboard adminTheme={adminTheme} onToggleAdminTheme={toggleAdminTheme} />}
          />
        </Route>
      </Routes>
    </div>
  );
};


function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
