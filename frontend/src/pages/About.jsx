import React, { useState } from 'react';

const About = () => {
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    const toggleHistory = (e) => {
        e.preventDefault();
        setIsHistoryExpanded(!isHistoryExpanded);
    };

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <section className="relative py-24 px-6 text-center overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-xs font-bold tracking-[0.4em] uppercase text-primary opacity-80">Established 1924</p>
                    <h1 className="serif-heading text-6xl md:text-8xl text-charcoal leading-tight">Our Story</h1>
                    <p className="text-lg md:text-xl font-light italic text-charcoal/60 max-w-2xl mx-auto">A Legacy of Culinary Excellence spanning over a century of innovation and tradition.</p>
                </div>
                {/* Decorative subtle element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
            </section>

            {/* Section 1: Our Legacy */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative group">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl">
                            <img
                                alt="Professional chef plating a gourmet dish"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                data-alt="Chef plating a gourmet dish with precision"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOonrpRq3E8oAWe5Ps2Qam5syoBYmjnQqUDwNBwdz2e7aD7okP7LPy_zcAxmdETAGCwTtXu9WqT4JyBPypI7QFZTMZr7J8LNnUbtStuN5ISFPwZd4KXuErkTjCazyFtYdZ8pl8I7yx7TWB7d8Tj7ggXFQIYZrojmhD5hFwWx5nIVT1rBjw9qs4kC9JIpIBpFGMPbyfOeT3f7rO4sxFbIwStfY7P1Mhc1Geoj71h2DH8X-m2lxZlUBHAuYwl9NAWLuS2c0KFztLSOo"
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="serif-heading text-4xl md:text-5xl">Our Legacy</h2>
                        <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
                            <p>Founded on the principles of uncompromising quality and seasonal reverence, KUKI began as a small family atelier in the heart of the city. For one hundred years, we have served as a sanctuary for those who view dining not just as a meal, but as a high art form.</p>

                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isHistoryExpanded ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                                <p className="mb-6">Our kitchen has been the training ground for legendary masters, each contributing a thread to the rich tapestry of our heritage. Today, we continue to blend time-honored techniques with contemporary culinary science.</p>
                                <p>Throughout the decades, we have remained steadfast in our commitment to sustainable sourcing and ethical gastronomy. Every ingredient tells a story of the land it came from, and every dish is a chapter in our ongoing pursuit of perfection.</p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={toggleHistory}
                                className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase group hover:text-primary-hover transition-colors focus:outline-none"
                            >
                                <span>{isHistoryExpanded ? "Read Less" : "Read more history"}</span>
                                <span
                                    className={`material-symbols-outlined transition-transform duration-300 ${isHistoryExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}
                                >
                                    trending_flat
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Our Philosophy */}
            <section className="py-24 bg-primary/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="serif-heading text-4xl md:text-5xl">Our Philosophy</h2>
                        <div className="w-16 h-0.5 bg-primary mx-auto opacity-50"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Card 1 */}
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-primary/10 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">eco</span>
                            </div>
                            <h3 className="serif-heading text-2xl">Seasonal Ingredients</h3>
                            <p className="text-charcoal/60 text-sm leading-relaxed">Sourced daily from our private gardens and local artisanal growers at the very peak of their harvest cycles.</p>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-primary/10 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">palette</span>
                            </div>
                            <h3 className="serif-heading text-2xl">Artistic Presentation</h3>
                            <p className="text-charcoal/60 text-sm leading-relaxed">Every plate is a canvas where color, texture, and geometry converge to create a visual and sensory symphony.</p>
                        </div>
                        {/* Card 3 */}
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-primary/10 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">star</span>
                            </div>
                            <h3 className="serif-heading text-2xl">Exceptional Service</h3>
                            <p className="text-charcoal/60 text-sm leading-relaxed">Anticipatory hospitality that is invisible yet omnipresent, ensuring every guest journey is flawlessly tailored.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Atmosphere & Artistry */}
            <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 space-y-8">
                        <h2 className="serif-heading text-4xl md:text-5xl">Atmosphere &amp; Artistry</h2>
                        <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
                            <p>Designed by master architects, the dining room at KUKI is an exercise in restrained luxury. Soft ambient lighting, bespoke velvet upholstery, and curated modern art create a space of quiet contemplation.</p>
                            <p>We believe that the environment is as vital as the ingredients. Our atmosphere is designed to remove the noise of the outside world, allowing you to focus entirely on the flavors and the company you keep.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="aspect-square rounded-lg overflow-hidden">
                                <img alt="Restaurant interior detail" className="w-full h-full object-cover" data-alt="Soft lighting in luxury dining room interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCePmnnNsYUrYfYnq2GbOJD5Qo4RpUT_b1WqbV8ZEnggcZGZyvXgPZKMgvI-WDxIuYSKIkOyU0eRJBPMP4mGFejevEcgbY0rmcIlXrNVkDbW1_I8J_uWj4ErSIzNjO70ryGAjdhOIh5ke-ngjaMhYm6RutzOeSAnAMyyAXYDsubvrWwZTni2K1lS5Gjiex7QZVabHgsWBxd3yUOOvK_VsTP-rPe_hEO_-xeHZpO6bDM64X8hZvXUSJN0R1M3x7u_WHuFVuEv6rqda0" />
                            </div>
                            <div className="aspect-square rounded-lg overflow-hidden">
                                <img alt="Fine glassware on table" className="w-full h-full object-cover" data-alt="Elegant glassware on a white tablecloth" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlcExWV68Gykj8JEoOG9neSVVso7t9MI6HoeGScKFWT9iHDiz44SDbdZurizpjcJOH6DXSlJlmo33UTGVEV9hoKK5iOjvuReIwcc2e_li4EWZbpoodS4ky_nkVRvleo5ZKVuqJHjx4VIz8we_WZY1x2nCuIBYFy1ez2YGprRIpDqcx_wOd1WU_I118ofgtwJGo-lbklRSYNhfld6JIxnNb5sg-PwyztVPptfAWH__0_wd3k3rL6wQ3MpXwH73qeB78qoBDns6kx2w" />
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="aspect-video lg:aspect-square overflow-hidden rounded-xl">
                            <img alt="Main dining hall of KUKI" className="w-full h-full object-cover shadow-2xl" data-alt="Modern minimalist luxury restaurant dining hall" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ2JeheKGODtR5y-C-oJL2KiYJ9M6ax25pOEQmiZW6mF50PR_n59HhhminWT11SCVocUV8micaCt93vWb7tj4R_y5m_lREmfiLV3PnHkFpZMkGIODuOvwBX0eOscNdpKK8WhSpVH48-Xua2Sgb-U1qAVOC6JKZ2d3xlJdFZfopjdzy2v5soeZJEV6R82Fy2oZdFjLYKrh0klHrHBfoLcjp_60ZjVS9FiuVdJGum7eQA1zIRt2U7yvdlJmE6rs4-QQwUniW_nn6xvo" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Statistics Section */}
            <section className="bg-charcoal text-white py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    <div className="space-y-2">
                        <span className="serif-heading text-5xl text-primary block">100</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Years of Heritage</span>
                    </div>
                    <div className="space-y-2">
                        <span className="serif-heading text-5xl text-primary block">12</span>
                        <span class="text-xs font-bold uppercase tracking-widest opacity-60">Master Chefs</span>
                    </div>
                    <div className="space-y-2">
                        <span className="serif-heading text-5xl text-primary block">3</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Global Locations</span>
                    </div>
                    <div className="space-y-2">
                        <span className="serif-heading text-5xl text-primary block">25</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Signature Dishes</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
