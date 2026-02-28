import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, CheckCircle2, AlertCircle, Save, LayoutGrid, List, Search } from 'lucide-react';

const AdminFeaturedMenu = ({ menuItems = [], onError, onSuccess }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                setLoadingFeatured(true);
                const res = await axios.get('/api/featured-menu');
                if (res.data && res.data.menuIds) {
                    setSelectedIds(res.data.menuIds.map(item => typeof item === 'object' ? item._id : item));
                }
            } catch (err) {
                console.error('Failed to fetch featured selection:', err);
            } finally {
                setLoadingFeatured(false);
            }
        };
        fetchFeatured();
    }, []);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            if (selectedIds.length >= 3) {
                onError('You can only select exactly 3 items for the home page.');
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSave = async () => {
        if (selectedIds.length !== 3) {
            onError('Please select exactly 3 items before saving.');
            return;
        }

        try {
            setSaving(true);
            await axios.put('/api/featured-menu', { menuIds: selectedIds });
            onSuccess('Home page featured menu updated successfully!');
        } catch (err) {
            onError('Failed to update featured menu');
        } finally {
            setSaving(false);
        }
    };

    const filteredMenu = (menuItems || []).filter(item =>
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.categoryId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loadingFeatured) return <div className="p-20 text-center text-soft-grey animate-pulse font-serif italic">Loading database selection...</div>;

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header for dynamic actions */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="serif-heading text-4xl text-charcoal capitalize">Featured</h1>
                    <p className="text-soft-grey text-sm mt-1">Select exactly 3 premium dishes to showcase in the "From Our Kitchen" section on your Home Page.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2.5 bg-white rounded-xl border border-primary/10 flex items-center gap-2 shadow-sm">
                        <span className={`w-3 h-3 rounded-full ${selectedIds.length === 3 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Selected: {selectedIds.length} / 3</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedIds.length !== 3}
                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        {saving ? 'Updating...' : <><Save size={16} /> Save Selection</>}
                    </button>
                </div>
            </div>

            {/* Selection Warning if not 3 */}
            {selectedIds.length !== 3 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700 mx-1">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">You need to select exactly <strong>3 items</strong>. Currently you have {selectedIds.length} selected.</p>
                </div>
            )}

            {/* Total Menu Balance Note */}
            {menuItems.length < 3 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 mx-1">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">Warning: You only have {menuItems.length} items in your menu. You need at least 3 items to save a featured selection.</p>
                </div>
            )}

            {/* Search and Grid Filter */}
            <div className="flex justify-between items-center gap-4 px-1">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-grey group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-primary/10 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid of Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-1">
                {filteredMenu.map(item => (
                    <div
                        key={item._id}
                        onClick={() => toggleSelection(item._id)}
                        className={`group bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden ${selectedIds.includes(item._id) ? 'border-primary ring-2 ring-primary/10 shadow-xl' : 'border-primary/5 hover:border-primary/20 hover:shadow-md'}`}
                    >
                        {/* Image Container */}
                        <div className="relative h-48 overflow-hidden">
                            {item.image ? (
                                <img src={item.image.startsWith('uploads') ? `/${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-background-ivory flex items-center justify-center text-primary/30">
                                    <Utensils size={40} />
                                </div>
                            )}

                            {/* Selection Overlay */}
                            <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity duration-300 ${selectedIds.includes(item._id) ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="bg-white rounded-full p-2 shadow-lg">
                                    <CheckCircle2 size={32} className="text-primary" />
                                </div>
                            </div>

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                    {item.categoryId?.name || 'Standard'}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-charcoal group-hover:text-primary transition-colors line-clamp-1">{item.name}</h4>
                                <span className="text-primary font-black text-sm">₹{item.price}</span>
                            </div>
                            <p className="text-soft-grey text-xs line-clamp-2 leading-relaxed">
                                {item.description || 'No description provided for this culinary masterpiece.'}
                            </p>
                        </div>
                    </div>
                ))}

                {filteredMenu.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-primary/20">
                        <Utensils size={40} className="mx-auto text-soft-grey/30 mb-4" />
                        <p className="text-soft-grey font-serif italic text-lg text-charcoal">"No culinary creations found matching your search."</p>
                        <p className="text-soft-grey text-xs mt-2 uppercase tracking-widest font-bold">Try adding items in the Menu section first.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeaturedMenu;
