import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/booking', label: 'Reservations' },
    { to: '/events', label: 'Events' },
    { to: '/about', label: 'About' },
    { to: '/feedback', label: 'Reviews' },
    { to: '/cancel-booking', label: 'Cancel Booking', className: 'font-bold text-primary/80' },
  ];

  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white py-5 border-b border-border-neutral sticky top-0 z-50">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <span className="serif-heading text-3xl font-bold tracking-[0.15em] text-charcoal uppercase leading-none">
            KUKI
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10 font-medium text-sm text-charcoal">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-primary transition-colors ${link.className || ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/booking" className="hidden sm:inline-flex bg-primary text-white px-8 py-2.5 rounded-full font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
            Book a Table
          </Link>

          <Link to="/booking" className="sm:hidden bg-primary text-white px-4 py-2 rounded-full font-medium text-xs hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
            Book
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden size-10 rounded-full border border-border-neutral flex items-center justify-center text-charcoal hover:text-primary hover:border-primary/30 transition-colors"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-neutral mt-4">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 flex flex-col gap-2 text-charcoal">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleMobileLinkClick}
                className={`py-2 text-sm font-medium hover:text-primary transition-colors ${link.className || ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
