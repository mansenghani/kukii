import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Plus, Minus, CheckCircle, AlertCircle, Clock, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PreOrder = () => {
    const { id: paramId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const queryParams = new URLSearchParams(location.search);
    const bookingId = paramId || queryParams.get('id');
    const type = queryParams.get('type') || (paramId ? 'event' : null);

    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState({}); // { itemId: quantity }

    useEffect(() => {
        if (cart && cart.length > 0 && Object.keys(selectedItems).length === 0) {
            const initialItems = {};
            cart.forEach(item => {
                initialItems[item._id] = item.quantity;
            });
            setSelectedItems(initialItems);
        }
    }, [cart]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [orderSummary, setOrderSummary] = useState(null);

    useEffect(() => {
        if (!bookingId || !type) {
            navigate('/');
            return;
        }
        fetchData();
    }, [bookingId, type]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menuRes, catRes] = await Promise.all([
                axios.get('/api/menu?limit=1000'), // Large limit for pre-order menu
                axios.get('/api/categories')
            ]);

            // Handle pagination objects by extracting data arrays safely
            const menuData = menuRes.data?.data || menuRes.data || [];
            const catData = catRes.data?.data || catRes.data || [];

            setMenuItems(Array.isArray(menuData) ? menuData : []);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (error) {
            setErrorMessage('Unable to load menu. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (id, delta) => {
        setSelectedItems(prev => {
            const newQty = (prev[id] || 0) + delta;
            if (newQty <= 0) {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            }
            return { ...prev, [id]: newQty };
        });
    };

    const calculateTotals = () => {
        let subtotal = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
            const item = menuItems.find(i => i._id === id);
            if (item) subtotal += item.price * qty;
        });
        const tax = subtotal * 0.05;
        return { subtotal, tax, total: subtotal + tax };
    };

    const handleSubmit = async () => {
        if (Object.keys(selectedItems).length === 0) {
            setErrorMessage('Please select at least one item.');
            return;
        }

        try {
            setSubmitting(true);
            const items = Object.entries(selectedItems).map(([id, qty]) => ({
                menuItemId: id,
                quantity: qty
            }));

            const response = await axios.post('/api/preorders', {
                bookingId,
                type,
                items
            });

            setOrderSummary(response.data);
            setStatus('success');
            clearCart();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save pre-order.');
            setStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'success' && orderSummary) {
        return (
            <div className="fade-in bg-background-ivory min-h-screen py-20 px-4">
                <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-border-neutral rounded-sm">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-primary w-8 h-8" />
                        </div>
                        <h2 className="serif-heading text-4xl mb-2 text-charcoal">Thank You for Your Order!</h2>
                        <p className="text-soft-grey text-sm font-light uppercase tracking-[0.2em] mb-8">Pending Host Confirmation</p>
                        <div className="h-[1px] bg-border-neutral w-20 mx-auto"></div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-background-ivory/50 p-6 rounded-sm border border-border-neutral shadow-inner">
                            <div className="flex items-center gap-2 mb-4">
                                <Utensils size={18} className="text-primary" />
                                <h3 className="serif-heading text-xl text-charcoal tracking-wide">Order Summary</h3>
                            </div>

                            <div className="space-y-4">
                                {orderSummary.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold text-charcoal uppercase tracking-[0.1em] text-[11px]">{item.name}</p>
                                            <p className="text-soft-grey text-[10px] italic">Quantity: {item.quantity}</p>
                                        </div>
                                        <span className="font-bold text-charcoal tracking-tighter">₹{item.total}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-4 border-t border-border-neutral space-y-2">
                                <div className="flex justify-between text-xs text-soft-grey uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-soft-grey uppercase tracking-widest pb-2">
                                    <span>Estimated Tax</span>
                                    <span>₹{orderSummary.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-border-neutral mt-4">
                                    <span className="serif-heading text-lg text-charcoal">Grand Total</span>
                                    <span className="serif-heading text-2xl text-primary font-black">₹{orderSummary.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-sm border border-amber-100 italic text-amber-700 text-xs text-center justify-center">
                            <Clock size={16} />
                            <span>Your selection is matched to your reservation and awaiting host confirmation.</span>
                        </div>

                        <div className="pt-6 flex flex-col gap-4">
                            <Link to="/" className="w-full h-14 bg-primary hover:bg-primary-hover text-white flex items-center justify-center rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/10">
                                RETURN TO HOME
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { subtotal, tax, total } = calculateTotals();

    return (
        <div className="fade-in bg-background-ivory min-h-screen">
            <section className="pt-24 pb-16 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <span className="text-primary font-medium tracking-[0.3em] text-[10px] uppercase mb-4 block">Gourmet Experience</span>
                    <h1 className="serif-heading text-6xl mb-6 relative inline-block">
                        Pre-Order Dining
                        <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
                    </h1>
                    <p className="text-soft-grey text-lg max-w-xl mx-auto mt-8 font-light leading-relaxed">
                        Submit your selections today. We will prepare everything fresh for your arrival.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                    {/* Menu Selection */}
                    <div className="lg:col-span-2 space-y-12">
                        {loading ? (
                            <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span></div>
                        ) : categories.map(category => {
                            const items = Array.isArray(menuItems) ? menuItems.filter(item => item.categoryId._id === category._id || item.categoryId === category._id) : [];
                            if (items.length === 0) return null;

                            return (
                                <div key={category._id} className="fade-in">
                                    <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-border-neutral pb-3 inline-block pr-10">{category.name}</h3>
                                    <div className="space-y-4">
                                        {items.map(item => (
                                            <div key={item._id} className="bg-white p-4 rounded-sm border border-border-neutral shadow-sm hover:shadow-md transition-all flex items-center group">
                                                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden rounded-md bg-background-ivory mr-4 border border-border-neutral/20">
                                                    <img
                                                        src={item.image ? (item.image.startsWith('uploads') ? `/${item.image}` : item.image) : 'https://via.placeholder.com/150?text=KUKI'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 flex justify-between items-center pr-2">
                                                    <div className="pr-4">
                                                        <h4 className="font-bold text-charcoal group-hover:text-primary transition-colors uppercase tracking-widest text-[13px]">{item.name}</h4>
                                                        <p className="text-soft-grey text-[11px] mt-1 font-light italic leading-relaxed line-clamp-2">{item.description}</p>
                                                        <p className="text-primary font-black mt-2 text-sm">₹{item.price}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-background-ivory p-2 rounded-sm border border-border-neutral/30 shrink-0">
                                                        <button
                                                            onClick={() => updateQuantity(item._id, -1)}
                                                            className="size-7 flex items-center justify-center hover:text-primary transition-colors disabled:opacity-20"
                                                            disabled={!selectedItems[item._id]}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-5 text-center font-black text-charcoal text-xs">{selectedItems[item._id] || 0}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item._id, 1)}
                                                            className="size-7 flex items-center justify-center hover:text-primary transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-border-neutral rounded-sm sticky top-32">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border-neutral">
                            <ShoppingBag className="text-primary w-5 h-5" />
                            <h3 className="serif-heading text-2xl text-charcoal">Your Order</h3>
                        </div>

                        <div className="min-h-[100px] mb-10">
                            {Object.keys(selectedItems).length === 0 ? (
                                <div className="py-10 text-center text-soft-grey italic text-xs font-light">
                                    "Good food is the foundation of genuine happiness."
                                </div>
                            ) : (
                                <div className="space-y-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(selectedItems).map(([id, qty]) => {
                                        const item = menuItems.find(i => i._id === id);
                                        return (
                                            <div key={id} className="flex justify-between items-start text-xs border-b border-border-neutral/30 pb-4 last:border-0 last:pb-0">
                                                <div className="flex-1 pr-6">
                                                    <p className="font-bold text-charcoal uppercase tracking-wider text-[10px]">{item?.name}</p>
                                                    <p className="text-soft-grey text-[9px] mt-1 italic">{qty} Units @ ₹{item?.price}</p>
                                                </div>
                                                <span className="font-bold text-charcoal tracking-tighter">₹{item ? item.price * qty : 0}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border-neutral">
                            <div className="flex justify-between text-[10px] text-soft-grey uppercase tracking-[0.2em] font-bold">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-soft-grey uppercase tracking-[0.2em] font-bold pb-4 border-b border-border-neutral/20">
                                <span>Tax (5.0%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 bg-background-ivory/50 px-6 -mx-6 rounded-sm">
                                <span className="serif-heading text-xl text-charcoal">Total</span>
                                <span className="serif-heading text-3xl text-primary font-black">₹{total.toFixed(2)}</span>
                            </div>
                        </div>


                        {errorMessage && (
                            <div className="mt-8 p-4 bg-rose-50 text-rose-600 text-[10px] uppercase font-black tracking-widest text-center border border-rose-100 flex items-center justify-center gap-3">
                                <AlertCircle size={14} /> {errorMessage}
                            </div>
                        )}

                        <button
                            disabled={submitting || Object.keys(selectedItems).length === 0}
                            onClick={handleSubmit}
                            className={`w-full h-15 mt-10 bg-primary hover:bg-primary-hover text-white rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/10 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
                        >
                            {submitting ? "SENDING REQUEST..." : "SUBMIT PRE-ORDER"}
                        </button>
                        <p className="mt-6 text-[9px] text-center text-soft-grey uppercase tracking-widest font-bold opacity-60">Payment handled upon arrival</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PreOrder;
