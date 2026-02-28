import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [settings, setSettings] = useState({
        restaurantName: 'KUKI',
        tagline: 'Providing a 5-star gastronomic experience with the finest ingredients and world-class service since 1924.',
        weekdayHours: '18:00 - 23:00',
        saturdayHours: '17:00 - 00:00',
        sundayHours: '17:00 - 22:00',
        phone: '+1 (234) 567-8910',
        email: 'reservations@kukidining.com',
        address: '123 Luxury Ave, Manhattan, NY',
        facebook: '#',
        instagram: '#',
        twitter: '#',
        whatsapp: '#',
        newsletterText: 'Join our club for exclusive events and seasonal updates.',
        copyrightText: '© 2024 KUKI DINING. ALL RIGHTS RESERVED.'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Use the public or admin GET endpoint
                const res = await axios.get('http://localhost:5050/api/admin/footer');
                if (res.data) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            } catch (error) {
                console.error("Error fetching footer settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="border-t border-border-neutral bg-background-ivory pt-20 pb-12 shadow-inner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-20 items-start gap-12 lg:gap-20">
                {/* Brand Column */}
                <div>
                    <div className="flex items-center gap-2 mb-10 h-8">
                        <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                        <h2 className="serif-heading text-2xl font-bold tracking-widest text-charcoal">{settings.restaurantName}</h2>
                    </div>
                    <p className="text-soft-grey text-sm leading-relaxed mb-6">
                        {settings.tagline}
                    </p>
                    <div className="flex gap-4">
                        {settings.facebook && settings.facebook !== '#' && (
                            <a className="w-9 h-9 rounded-full border border-border-neutral flex items-center justify-center text-soft-grey hover:text-primary hover:border-primary transition-all duration-300 shadow-sm hover:scale-110 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(183,110,121,0.4)]" href={settings.facebook} target="_blank" rel="noopener noreferrer">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </a>
                        )}
                        {settings.instagram && settings.instagram !== '#' && (
                            <a className="w-9 h-9 rounded-full border border-border-neutral flex items-center justify-center text-soft-grey hover:text-primary hover:border-primary transition-all duration-300 shadow-sm hover:scale-110 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(183,110,121,0.4)]" href={settings.instagram} target="_blank" rel="noopener noreferrer">
                                <span className="material-symbols-outlined text-lg">camera_alt</span>
                            </a>
                        )}
                        {settings.whatsapp && settings.whatsapp !== '#' && (
                            <a className="w-9 h-9 rounded-full border border-border-neutral flex items-center justify-center text-soft-grey hover:text-primary hover:border-primary transition-all duration-300 shadow-sm hover:scale-110 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(183,110,121,0.4)]" href={`https://wa.me/${settings.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <span className="material-symbols-outlined text-lg">chat</span>
                            </a>
                        )}
                    </div>
                </div>
                {/* Opening Hours */}
                <div>
                    <h4 className="font-light text-charcoal uppercase tracking-[0.25em] text-xs mb-10 h-8 flex items-center">Opening Hours</h4>
                    <ul className="text-sm text-soft-grey space-y-2">
                        <li className="flex justify-between items-center border-b border-border-neutral/40 py-3 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded">
                            <span>Monday - Friday</span>
                            <span className="text-charcoal font-medium text-right group-hover:text-primary transition-colors duration-300">{settings.weekdayHours}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-border-neutral/40 py-3 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded">
                            <span>Saturday</span>
                            <span className="text-charcoal font-medium text-right group-hover:text-primary transition-colors duration-300">{settings.saturdayHours}</span>
                        </li>
                        <li className="flex justify-between items-center py-3 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded">
                            <span>Sunday</span>
                            <span className="text-charcoal font-medium text-right group-hover:text-primary transition-colors duration-300">{settings.sundayHours}</span>
                        </li>
                    </ul>
                </div>
                {/* Contact Us */}
                <div>
                    <h4 className="font-light text-charcoal uppercase tracking-[0.25em] text-xs mb-10 h-8 flex items-center">Contact Us</h4>
                    <ul className="space-y-4 text-sm text-soft-grey">
                        <li className="flex items-start gap-4 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded cursor-default py-2">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5 group-hover:scale-110 transition-transform duration-300">location_on</span>
                            {settings.mapLink ? (
                                <a href={settings.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{settings.address}</a>
                            ) : (
                                <span>{settings.address}</span>
                            )}
                        </li>
                        <li className="flex items-start gap-4 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded cursor-default py-2">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5 group-hover:scale-110 transition-transform duration-300">call</span>
                            <span>{settings.phone}</span>
                        </li>
                        <li className="flex items-start gap-4 hover:bg-white hover:pl-4 hover:shadow-sm px-2 -mx-2 transition-all duration-300 group rounded cursor-default py-2">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5 group-hover:scale-110 transition-transform duration-300">mail</span>
                            <a className="hover:text-primary transition-colors" href={`mailto:${settings.email}`}>{settings.email}</a>
                        </li>
                    </ul>
                </div>
                {/* Newsletter */}
                <div>
                    <h4 className="font-light text-charcoal uppercase tracking-[0.25em] text-xs mb-10 h-8 flex items-center">Newsletter</h4>
                    <p className="text-soft-grey text-sm mb-6">{settings.newsletterText}</p>
                    <div className="flex items-center group transition-shadow duration-500 rounded-md">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-soft-grey text-lg">mail</span>
                            <input className="w-full pl-11 pr-4 py-3 bg-white border border-border-neutral rounded-l-md text-xs focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 focus:shadow-[0_0_10px_rgba(183,110,121,0.15)] hover:border-soft-grey/40" placeholder="Your email" type="email" />
                        </div>
                        <button className="bg-primary text-white px-6 py-3 rounded-r-md text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover hover:shadow-lg active:scale-95 transition-all duration-300 hover:translate-y-[-2px] active:scale-[0.98]">
                            Join
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-border-neutral/30 flex flex-col items-center gap-4 text-center">
                <p className="text-soft-grey text-[10px] uppercase tracking-widest opacity-80">{settings.copyrightText}</p>
                <div className="flex gap-6 text-[10px] uppercase tracking-widest text-soft-grey font-bold">
                    <Link className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full" to="/cancel-booking">CANCEL BOOKING</Link>
                    <a className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full" href="#">PRIVACY POLICY</a>
                    <a className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full" href="#">TERMS OF SERVICE</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
