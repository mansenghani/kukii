import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white py-5 border-b border-border-neutral sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <span className="serif-heading text-3xl font-bold tracking-[0.15em] text-charcoal uppercase leading-none">
            KUKI
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10 font-medium text-sm text-charcoal">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
          <Link to="/booking" className="hover:text-primary transition-colors">Reservations</Link>
          <Link to="/events" className="hover:text-primary transition-colors">Events</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/feedback" className="hover:text-primary transition-colors">Reviews</Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <Link to="/booking" className="bg-primary text-white px-8 py-2.5 rounded-full font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
            Book a Table
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
