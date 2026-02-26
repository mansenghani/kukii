import React from 'react';
import Menu from './Navbar';

const Header = ({ children }) => {
    return (
        <div className="text-charcoal body-text selection:bg-primary selection:text-white bg-background-ivory">
            <Menu />
            <main>
                {children}
            </main>
        </div>
    );
};

export default Header;
