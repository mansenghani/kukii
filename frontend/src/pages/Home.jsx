import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Quote, ChevronRight, User } from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await axios.get('/api/feedback/approved');
        setReviews(res.data.slice(0, 3));
      } catch (err) {
        console.error('Home feedback fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeatured = async () => {
      try {
        setFeaturedLoading(true);
        const res = await axios.get('/api/featured-menu');
        if (res.data && res.data.menuIds && res.data.menuIds.length === 3) {
          setFeaturedItems(res.data.menuIds);
        } else {
          // Fallback data if none selected
          setFeaturedItems([
            {
              _id: 'fallback-1',
              name: 'Truffle Risotto',
              price: 42,
              description: 'Wild forest mushrooms, aged parmesan, fresh seasonal black truffle, and micro-herbs.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh66ll9vNt1D8G10i98_DquZdwjzqW6fnon8cLhWxx2AEq0xo5_yKBGz9qjpTOOJpSdj6qCUM8hoDdRPHOZOA-OqJGdbodgo1JPOo4_dD4ddMs01mx4wH6SdLpqrMYk1NXTC1IZ7uqOBONQqJWDPG80A172MIfyCQ5AdjAIf3sZfq7c0Dw6WKSclXnvMv19Z3HcvUP7pe7b6vn9wkOit9u_wwGw9OPgZ6d7W8kaPPCx81p7b0a48Vy9CglVJLOYqM-k8JQNTSt7Vc'
            },
            {
              _id: 'fallback-2',
              name: 'Wagyu Ribeye',
              price: 125,
              description: 'A5 Miyazaki, roasted marrow bone, herb-infused butter, and Himalayan sea salt.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuKc8EiO5h9hvmXvRld0hLb3NfVVPw2W16kcYaCxMzQtPOmC4L68C-NZZtFHsgPh8FanU7hUXo6ilv8mik3gZdMKt0GS8nPM2UPeYkCrcFxYmqMxh2kY5HOp7cztYP-fizhyoMQ6egXvcKohuF44i77dgAjGtholNR6nZnyM3ONcj--rb6u-KHUsCGIRgX2sp13MFab9e0yWMJKz83VIcu2djRtseAHFgmla_URDs7JBSeZe5JTIGJLYWsvddApZ2xcmK4XC5O_Hg'
            },
            {
              _id: 'fallback-3',
              name: 'Gold Leaf Opera',
              price: 28,
              description: '70% Dark chocolate ganache, espresso-soaked sponge, and 24k edible gold leaf.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1FxieY0F7bZC1yIFLI-NTfioKyej6ahuV43oSfuZxGZddBKzkkQIfUc9daBkBd6ic640pTWM9T66SWOUwztflH4z1777g52VU79LTvEbjv02-ME8Q1h42hO6iRXPMTLYs0avABOR1LYpk-zPZqSctuEAQDqHwmNrd-fcxiNc8Rg0E7QDL6f1-dmFmadF5N5W5Hma0tNMddSgdBXPZq9hB12q7o5n7fNEsKHGAIDG25gL4_fcZu7vKaZ_MU6z5dTegBnGplveHJqM'
            }
          ]);
        }
      } catch (err) {
        console.error('Featured menu fetch error:', err);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchApproved();
    fetchFeatured();
  }, []);

  return (
    <div className="fade-in">
      <section className="relative bg-background-ivory py-12 lg:py-20 overflow-hidden">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="order-2 lg:order-1 flex flex-col gap-8">
              <div className="space-y-4">
                <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm block">Established 1924</span>
                <h1 className="serif-heading text-5xl lg:text-7xl leading-tight text-charcoal">
                  Exquisite Dining <br />
                  <span className="italic font-normal">Redefined</span>
                </h1>
                <p className="text-soft-grey text-lg max-w-lg leading-relaxed">
                  Experience the pinnacle of culinary artistry in a setting of unparalleled elegance and sophisticated charm. Where every flavor tells a story of heritage.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/booking" className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm shadow-xl hover:translate-y-[-2px] transition-all inline-block text-center">
                  Reserve Now
                </Link>
                <Link to="/menu" className="border border-primary text-primary px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:bg-white transition-all inline-block text-center">
                  View Menu
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative group">
                <div className="absolute -inset-4 border border-primary/20 rounded-xl translate-x-8 translate-y-8 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                <div className="w-full h-[500px] lg:h-[650px] bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWw-KXo6CFaZHk4WTFUbZKFb-QK_FpPqNs7BZ1uA-NW2YdbLkm4CXp_2fDheThFYRJCRdz8dz0Kr_HaXULqTef5hXY3xRMIPCamw_ZLVT8K5plF2WIO7_mL8xDMU64pZ4UFdyJDOKBCN9gR6sJH8JhKcFk8SmmpanGPhnMym8JkCp7DRpMfjDXoU-zfbhmmGuVkO9ADT50zJoxgzwOTJ7FO3brQ6yJaSsDe8FLXW3stWtdAB15GcaG0b5i_B-TrWTJAaO1azg-BrU")' }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background-ivory py-16 lg:py-24 border-b border-border-neutral">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="order-1">
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/10 rounded-xl -translate-x-4 -translate-y-4 -z-10"></div>
                <img alt="Chef" className="w-full h-[500px] lg:h-[600px] object-cover rounded-xl shadow-xl transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaBgmNTetlw2ebWYxhQlSP376Bm8wf3pAICT-PKzGE_NSzA6BheTzzTPmE9m1PSWWm2t21wBVXF5pFa5pLPUqi1r9X4oHWD8f5pgQGjR8JYDdYWcyuVmCzHruB8xbuSvW_DSZYLCI-Xr15IPg30Wew9EdG7den0_0tKHXeZxVbV8Qs6olt9mJljO8d4K1nVOv30oW105iZ1tBDiIYl2SbyNP4IT_T6JANkEl829MyRCtlKTPWGZ4Xq1qHkaE0QrF60s7OCMgWyDXs" />
              </div>
            </div>
            <div className="order-2 flex flex-col gap-6">
              <div className="space-y-4">
                <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Our Legacy</span>
                <h2 className="serif-heading text-4xl lg:text-5xl text-charcoal leading-tight">
                  A Culinary Journey <br />Since 1995
                </h2>
                <p className="text-soft-grey text-lg leading-relaxed max-w-xl">
                  At KUKI, we believe that dining is an art form. For nearly three decades, we have remained committed to the tradition of fine dining, sourcing only the highest quality seasonal ingredients and maintaining Michelin-starred standards in every dish we serve.
                </p>
              </div>
              <div>
                <Link className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase hover:gap-4 transition-all duration-300" to="/about">
                  Learn More About Us
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="bg-white py-16 lg:py-24 border-b border-border-neutral">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="space-y-2">
              <h2 className="serif-heading text-4xl text-charcoal">From Our Kitchen</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto mt-4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {featuredItems.map((item) => (
              <div key={item._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border-neutral font-sans">
                <div className="relative h-72 overflow-hidden">
                  <div
                    className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url("${item.image ? (item.image.startsWith('uploads') ? `/${item.image}` : item.image) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000'}")` }}
                  ></div>
                </div>
                <div className="p-8 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="serif-heading text-xl font-bold group-hover:text-primary transition-colors">{item.name}</h3>
                    <span className="text-primary font-bold text-lg">₹{item.price}</span>
                  </div>
                  <p className="text-soft-grey text-sm leading-relaxed font-sans line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/menu" className="bg-charcoal text-white px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">
              Discover Full Palette
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Stat Section */}
      <section className="bg-[#f4efec] py-20 border-b border-border-neutral">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 grid grid-cols-2 md:grid-cols-4 gap-12 text-center font-sans">
          <div>
            <div className="text-4xl serif-heading text-primary mb-2">29+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Years Excellence</div>
          </div>
          <div>
            <div className="text-4xl serif-heading text-primary mb-2">4.9</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Avg Guest Rating</div>
          </div>
          <div>
            <div className="text-4xl serif-heading text-primary mb-2">12</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Master Chefs</div>
          </div>
          <div>
            <div className="text-4xl serif-heading text-primary mb-2">08+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Global Awards</div>
          </div>
        </div>
      </section>

      {/* Dynamized Experiences Section */}
      <section className="bg-white py-24">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px]">Voices of Excellence</span>
            <h2 className="serif-heading text-5xl text-charcoal tracking-tight lowercase">Guest stories</h2>
            <div className="w-16 h-px bg-primary/30 mx-auto"></div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-soft-grey italic font-serif">Curating the finest moments...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-background-ivory rounded-3xl border border-border-neutral">
              <p className="text-soft-grey italic font-serif text-lg">"Be the first to script your culinary journey with us."</p>
              <Link to="/feedback" className="mt-6 inline-block text-primary font-bold text-[10px] uppercase tracking-widest hover:gap-4 transition-all">Share Story →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-10 rounded-3xl border border-border-neutral hover:border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 relative font-sans">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rev.rating ? 'fill-primary text-primary' : 'text-border-neutral'} />)}
                  </div>
                  <Quote size={40} className="absolute top-8 right-10 text-border-neutral/30 -rotate-12" strokeWidth={1} />
                  <p className="text-charcoal italic leading-relaxed mb-10 font-serif text-lg">"{rev.message}"</p>
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-background-ivory flex items-center justify-center text-primary border border-primary/10">
                      <User size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-charcoal font-extrabold text-[10px] uppercase tracking-widest">{rev.name}</p>
                      <p className="text-soft-grey text-[9px] uppercase tracking-widest font-bold">Verified Guest</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link to="/feedback" className="inline-flex items-center gap-2 border border-primary/20 text-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">
              Read More Narratives
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
