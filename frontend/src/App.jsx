import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import AdminDashboard from './pages/Admin/Dashboard';
import { CartProvider } from './context/CartContext';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      ) : (
        <>
          <Header>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/booking" element={<Booking />} />
            </Routes>
          </Header>
          <Footer />
        </>
      )}
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
