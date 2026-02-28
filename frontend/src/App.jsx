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
import EventBooking from './pages/EventBooking';
import PreOrder from './pages/PreOrder';
import CancelBooking from './pages/CancelBooking';

import AdminDashboard from './pages/Admin/Dashboard';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
  return (
    <div className="app-container">
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route path="/*" element={
          <>
            <Header>
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
        <Route path="/admin" element={<AdminDashboard />} /> {/* Login/Dashboard Entry */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin/:tab" element={<AdminDashboard />} />
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
