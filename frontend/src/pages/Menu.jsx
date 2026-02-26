import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Menu = () => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          axios.get('http://localhost:5050/api/menu'),
          axios.get('http://localhost:5050/api/categories')
        ]);
        setMenuItems(menuRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabClick = (e, tabId) => {
    e.preventDefault();
    setActiveTab(tabId);
  };

  const renderCard = (item) => (
    <div key={item._id} className="menu-card bg-white rounded-[14px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group">
      <div className="relative h-64 overflow-hidden">
        <img
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={item.image || 'https://via.placeholder.com/400x300?text=KUKI+Dish'}
        />
        {!item.availability && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold uppercase tracking-widest text-sm border-2 border-white px-4 py-1">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-charcoal">{item.name}</h3>
          <span className="text-primary font-bold">₹{item.price}</span>
        </div>
        <p className="text-soft-grey text-sm leading-relaxed line-clamp-2">{item.description}</p>
      </div>

      {item.availability && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => addToCart({ ...item, quantity: 1 })}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );

  // Group items by category
  const groupedMenu = categories.reduce((acc, cat) => {
    acc[cat._id] = {
      title: cat.name,
      items: menuItems.filter(item => (item.categoryId?._id || item.categoryId) === cat._id)
    };
    return acc;
  }, {});

  return (
    <div className="fade-in bg-background-ivory min-h-screen">
      {/* Hero Section */}
      <section className="py-24 text-center px-4">
        <h1 className="serif-heading text-5xl md:text-7xl mb-6 text-charcoal">From Our Kitchen</h1>
        <p className="text-lg md:text-xl text-soft-grey font-light tracking-widest uppercase">Crafted with Passion & Precision</p>
      </section>

      {/* Category Navigation */}
      <section className="max-w-6xl mx-auto mb-16 px-4">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 border-b border-border-neutral pb-4">
          <button
            className={`nav-tab transition-all duration-300 cursor-pointer pb-2 text-sm font-bold uppercase tracking-widest ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-soft-grey hover:text-charcoal'}`}
            onClick={(e) => handleTabClick(e, 'all')}
          >
            All Dishes
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              className={`nav-tab transition-all duration-300 cursor-pointer pb-2 text-sm font-bold uppercase tracking-widest ${activeTab === cat._id ? 'text-primary border-b-2 border-primary' : 'text-soft-grey hover:text-charcoal'}`}
              onClick={(e) => handleTabClick(e, cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-soft-grey font-medium uppercase tracking-widest text-xs">Preparing our curated menu...</p>
          </div>
        ) : (
          Object.entries(groupedMenu).map(([catId, catData]) => {
            const isVisible = activeTab === 'all' || activeTab === catId;
            if (!isVisible || catData.items.length === 0) return null;

            return (
              <div key={catId} className="mb-20 animate-fade-in">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="serif-heading text-3xl text-charcoal whitespace-nowrap">{catData.title}</h2>
                  <div className="h-px bg-primary/20 w-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {(activeTab === 'all' ? catData.items.slice(0, 6) : catData.items).map(item => renderCard(item))}
                </div>
                {activeTab === 'all' && catData.items.length > 6 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setActiveTab(catId)}
                      className="text-primary font-bold text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
                    >
                      View All {catData.title} Items →
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {!loading && menuItems.length === 0 && (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-border-neutral border-dashed">
            <p className="text-soft-grey italic">Our chefs are currently updating the seasonal menu. Please check back shortly.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center px-4 bg-charcoal text-white rounded-t-[50px]">
        <div className="max-w-2xl mx-auto">
          <h2 className="serif-heading text-4xl mb-8">Ready for an Unforgettable Experience?</h2>
          <Link className="inline-block bg-primary text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-primary-hover transition-all shadow-2xl hover:scale-105" to="/booking">
            Reserve Your Table
          </Link>
          <p className="mt-6 text-sm text-soft-grey uppercase tracking-widest font-medium">Accepting reservations daily from 12 PM - 11 PM</p>
        </div>
      </section>
    </div>
  );
};

export default Menu;
