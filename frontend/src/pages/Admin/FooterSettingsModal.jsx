import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageSquare, ShieldCheck, Loader2, Clock, Globe, Type } from 'lucide-react';

const FooterSettingsModal = ({ isOpen, onClose, onSave }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: '',
        tagline: '',
        weekdayHours: '',
        saturdayHours: '',
        sundayHours: '',
        phone: '',
        alternatePhone: '',
        email: '',
        address: '',
        mapLink: '',
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp: '',
        newsletterText: '',
        copyrightText: ''
    });

    const API_URL = 'http://localhost:5050/api/admin/footer';

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL);
            if (res.data) {
                setFormData(res.data);
            }
        } catch (error) {
            console.error("Error fetching footer settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await axios.put(API_URL, formData);
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error("Error saving footer settings:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl relative overflow-hidden border border-primary/10 my-8">
                {/* Header */}
                <div className="bg-background-ivory/50 px-10 py-8 border-b border-primary/10 flex justify-between items-center">
                    <div>
                        <h3 className="serif-heading text-3xl text-charcoal leading-tight">Footer Management</h3>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">Manage complete restaurant branding & contact details</p>
                    </div>
                    <button onClick={onClose} className="size-12 rounded-full hover:bg-white flex items-center justify-center text-soft-grey hover:text-primary transition-all border border-transparent hover:border-primary/10">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-soft-grey">
                        <Loader2 className="animate-spin mb-4 text-primary" size={40} />
                        <p className="text-sm font-medium italic">Loading current settings...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* Brand & Identity */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/40">
                                    <Type size={14} /> Brand & Identity
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Restaurant Name</label>
                                        <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Tagline / Description</label>
                                        <textarea name="tagline" value={formData.tagline} onChange={handleChange} className="w-full h-24 p-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Operational Hours */}
                            <div className="space-y-6 pt-8 border-t border-primary/5">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/40">
                                    <Clock size={14} /> Opening Hours
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Monday - Friday</label>
                                        <input name="weekdayHours" value={formData.weekdayHours} onChange={handleChange} placeholder="e.g. 18:00 - 23:00" className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Saturday</label>
                                        <input name="saturdayHours" value={formData.saturdayHours} onChange={handleChange} placeholder="e.g. 17:00 - 00:00" className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Sunday</label>
                                        <input name="sundayHours" value={formData.sundayHours} onChange={handleChange} placeholder="e.g. 17:00 - 22:00" className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-6 pt-8 border-t border-primary/5">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/40">
                                    <Phone size={14} /> Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Primary Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Business Email</label>
                                        <input name="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Physical Address</label>
                                        <input name="address" value={formData.address} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Social Presence */}
                            <div className="space-y-6 pt-8 border-t border-primary/5">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/40">
                                    <Globe size={14} /> Social & Connectivity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Facebook Profile Link</label>
                                        <input name="facebook" value={formData.facebook} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Instagram Profile Link</label>
                                        <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">WhatsApp Business Number</label>
                                        <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Twitter (X) Profile Link</label>
                                        <input name="twitter" value={formData.twitter} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Text */}
                            <div className="space-y-6 pt-8 border-t border-primary/5">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/40">
                                    <ShieldCheck size={14} /> Newsletter & Footer Text
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Newsletter Invitation Text</label>
                                        <input name="newsletterText" value={formData.newsletterText} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-widest">Copyright Statement</label>
                                        <input name="copyrightText" value={formData.copyrightText} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-background-ivory/20 focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Buttons */}
                        <div className="px-10 py-8 bg-background-ivory/50 flex gap-4 border-t border-primary/10">
                            <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-background-ivory text-charcoal py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-primary/10 shadow-sm active:scale-95 text-center">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save All Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FooterSettingsModal;
