import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageSquareQuote, ChevronRight, Quote, User, Mail } from 'lucide-react';

const Feedback = () => {
    const [reviews, setReviews] = useState([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const API_BASE_URL = 'http://localhost:5050/api';

    useEffect(() => {
        fetchApprovedReviews();
    }, []);

    const fetchApprovedReviews = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/feedback/approved`);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching approved reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating score (stars).');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/feedback`, {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                rating: rating
            });
            alert(response.data.message || 'Feedback submitted successfully!');
            setFormData({ name: '', email: '', message: '' });
            setRating(0);
        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || 'Failed to submit. Please try again.';
            alert(`Submission Failed: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const getPercentage = (stars) => {
        if (!reviews.length) return "0%";
        const count = reviews.filter(r => r.rating === stars).length;
        const maxCount = Math.max(...[5, 4, 3, 2, 1].map(s => reviews.filter(r => r.rating === s).length));
        if (maxCount === 0) return "0%";
        return `${Math.round((count / maxCount) * 100)}%`;
    };

    return (
        <div className="fade-in bg-gradient-to-b from-background-ivory/20 via-white to-background-ivory/30">
            {/* Hero Section */}
            <header className="pt-24 pb-12 text-center w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase block mb-4 text-primary">Guest Testimonials</span>
                <h1 className="text-5xl md:text-7xl serif-heading mb-6 text-charcoal tracking-tight lowercase">Refined Voices</h1>
                <p className="text-soft-grey text-lg max-w-2xl mx-auto italic font-serif">"Every meal tells a story. Share yours with us."</p>
                <div className="w-16 h-[1px] mx-auto mt-10 bg-primary/40"></div>
            </header>

            {/* Approved Reviews Section */}
            <section className="py-12 w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
                {loading ? (
                    <div className="text-center py-20 text-soft-grey animate-pulse">Loading experience stories...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-border-neutral rounded-2xl">
                        <MessageSquareQuote className="mx-auto text-border-neutral mb-4" size={48} />
                        <h3 className="serif-heading text-2xl text-charcoal">No reviews available</h3>
                        <p className="text-soft-grey mt-2">Be the first to share your KUKI experience!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-3 gap-8">
                            {reviews.slice(0, visibleCount).map((review) => (
                                <div key={review._id} className="bg-white p-10 rounded-3xl border border-border-neutral/60 flex flex-col hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <Quote size={32} className="absolute top-6 right-6 text-primary/10 -rotate-12" strokeWidth={1} />
                                    <div className="relative z-10">
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'fill-primary text-primary' : 'text-border-neutral'} />
                                            ))}
                                        </div>
                                        <p className="text-charcoal italic mb-8 leading-relaxed font-serif text-base">"{review.message}"</p>
                                        <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border-neutral/30">
                                            <div className="size-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center font-bold text-sm text-primary border border-primary/20 shadow-sm">
                                                {review.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[10px] uppercase tracking-widest text-charcoal">{review.name}</h4>
                                                <p className="text-[9px] text-soft-grey tracking-wider">Verified Guest • {new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {visibleCount < reviews.length && (
                            <div className="text-center mt-12">
                                <button onClick={() => setVisibleCount(v => v + 3)} className="px-8 py-3 rounded-full border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                                    Load More Experiences
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Rating Summary Section */}
            <section className="py-24 bg-gradient-to-b from-white/60 to-background-ivory/40 border-y border-border-neutral">
                <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 grid md:grid-cols-2 gap-20 items-center">
                    <div className="text-center md:text-left space-y-6">
                        <div className="inline-block md:block">
                            <div className="text-8xl serif-heading text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 mb-3">{avgRating}</div>
                            <div className="flex justify-center md:justify-start gap-1.5 mb-6">
                                {[...Array(5)].map((_, i) => {
                                    const fullStars = Math.floor(avgRating);
                                    const decimalPart = avgRating - fullStars;
                                    
                                    if (i < fullStars) {
                                        return <Star key={i} size={24} className="fill-primary text-primary" />;
                                    } else if (i === fullStars && decimalPart > 0) {
                                        return (
                                            <div key={i} className="relative">
                                                <Star size={24} className="text-border-neutral" />
                                                <div className="absolute inset-0 overflow-hidden" style={{ width: `${decimalPart * 100}%` }}>
                                                    <Star size={24} className="fill-primary text-primary" />
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return <Star key={i} size={24} className="text-border-neutral" />;
                                    }
                                })}
                            </div>
                        </div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-charcoal">Average Guest Satisfaction</p>
                        <p className="text-sm text-soft-grey italic">Based on {reviews.length} authentic experiences</p>
                    </div>
                    <div className="space-y-5">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-3.5 group">
                                <div className="flex gap-0.5 justify-end w-[84px] shrink-0">
                                    {[...Array(stars)].map((_, i) => (
                                        <Star key={i} size={13} className="fill-primary text-primary" />
                                    ))}
                                </div>
                                <div className="flex-1 bg-border-neutral/30 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 group-hover:shadow-lg group-hover:shadow-primary/30" style={{ width: getPercentage(stars) }}></div>
                                </div>
                                <span className="text-[10px] text-soft-grey w-10 text-right font-medium">{getPercentage(stars)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Submission Form Section */}
            <section id="leave-review" className="py-24 bg-gradient-to-b from-background-ivory/40 to-white/50">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white p-12 rounded-4xl shadow-2xl border border-border-neutral/40 backdrop-blur-sm">
                        <div className="text-center mb-12 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                <Quote size={32} className="text-primary" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-4xl serif-heading text-charcoal">Share Your Experience</h2>
                            <p className="text-[11px] text-soft-grey uppercase tracking-widest font-bold">Help us refine excellence through your voice</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal flex items-center gap-2">
                                        <User size={14} className="text-primary" />
                                        Your Name
                                    </label>
                                    <div className="relative">
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-b-2 border-border-neutral p-3 text-sm focus:border-primary transition-all bg-transparent outline-none focus:bg-background-ivory/20 rounded-t" placeholder="e.g. John Doe" required />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal flex items-center gap-2">
                                        <Mail size={14} className="text-primary" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-b-2 border-border-neutral p-3 text-sm focus:border-primary transition-all bg-transparent outline-none focus:bg-background-ivory/20 rounded-t" placeholder="john@example.com" required />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 text-charcoal flex items-center gap-2">
                                    <Star size={14} className="text-primary" />
                                    Your Rating
                                </label>
                                <div className="flex gap-3 p-4 bg-background-ivory/40 rounded-2xl w-fit">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="focus:outline-none transition-all active:scale-95 hover:scale-110">
                                            <Star size={28} className={(hoverRating || rating) >= star ? 'fill-primary text-primary' : 'text-border-neutral'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal flex items-center gap-2">
                                    <MessageSquareQuote size={14} className="text-primary" />
                                    Your Message
                                </label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full border-2 border-border-neutral/30 rounded-2xl p-4 text-sm focus:border-primary focus:bg-background-ivory/50 transition-all bg-background-ivory h-40 resize-none outline-none block" placeholder="Share the highlights of your dining experience..." required></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 hover:from-primary-hover hover:to-primary/70 shadow-lg">
                                {isSubmitting ? 'Submitting Review...' : '✓ Submit Your Review'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-28 text-center border-t border-border-neutral bg-gradient-to-br from-charcoal to-charcoal/95 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-5xl serif-heading mb-6 text-white">Ready to Experience KUKI?</h2>
                    <p className="text-white/60 text-sm mb-10 max-w-2xl mx-auto">Reserve your table today and become part of our story</p>
                    <Link to="/booking" className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-14 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all hover:gap-5 shadow-2xl hover:shadow-primary/40 active:scale-95">
                        Book Your Table <ChevronRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Feedback;
