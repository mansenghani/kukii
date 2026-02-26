import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageSquareQuote, ChevronRight } from 'lucide-react';

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
        return `${Math.round((count / reviews.length) * 100)}%`;
    };

    return (
        <div className="fade-in bg-background-ivory/30">
            {/* Hero Section */}
            <header className="pt-24 pb-12 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase block mb-4 text-primary">Guest Testimonials</span>
                <h1 className="text-5xl md:text-7xl serif-heading mb-6 text-charcoal tracking-tight lowercase">Refined Voices</h1>
                <p className="text-soft-grey text-lg max-w-2xl mx-auto italic font-serif">"Every meal tells a story. Share yours with us."</p>
                <div className="w-16 h-[1px] mx-auto mt-10 bg-primary/40"></div>
            </header>

            {/* Approved Reviews Section */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                <div key={review._id} className="bg-white p-10 rounded-2xl border border-border-neutral flex flex-col hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? 'fill-primary text-primary' : 'text-border-neutral'} />
                                        ))}
                                    </div>
                                    <p className="text-charcoal italic mb-8 leading-relaxed font-serif text-lg">"{review.message}"</p>
                                    <div className="mt-auto flex items-center gap-4">
                                        <div className="size-10 bg-background-ivory rounded-full flex items-center justify-center font-bold text-xs text-primary border border-primary/10">
                                            {review.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-charcoal">{review.name}</h4>
                                            <p className="text-[10px] text-soft-grey tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</p>
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
            <section className="py-20 bg-white/50 border-y border-border-neutral">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
                    <div className="text-center md:text-left">
                        <div className="text-7xl serif-heading text-charcoal mb-2">{avgRating}</div>
                        <div className="flex justify-center md:justify-start gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} className={i < Math.floor(avgRating) ? 'fill-primary text-primary' : 'text-border-neutral'} />
                            ))}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-charcoal">Aggregated Guest Satisfaction</p>
                    </div>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-4">
                                <span className="text-[10px] font-bold w-12 text-right uppercase tracking-widest text-charcoal">{stars} Stars</span>
                                <div className="flex-1 bg-border-neutral h-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/60 transition-all duration-700" style={{ width: getPercentage(stars) }}></div>
                                </div>
                                <span className="text-[10px] text-soft-grey w-8 text-right font-medium italic">{getPercentage(stars)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Submission Form Section */}
            <section id="leave-review" className="py-24 bg-white/30">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white p-12 rounded-3xl shadow-xl border border-border-neutral">
                        <div className="text-center mb-12">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4">rate_review</span>
                            <h2 className="text-4xl serif-heading mb-2 text-charcoal">Leave a Review</h2>
                            <p className="text-[10px] text-soft-grey uppercase tracking-widest font-bold">Your feedback shapes our legacy</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal">Your Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-b border-border-neutral p-3 text-sm focus:border-primary transition-all bg-transparent outline-none" placeholder="e.g. John Doe" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-b border-border-neutral p-3 text-sm focus:border-primary transition-all bg-transparent outline-none" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal">Rating Score</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="focus:outline-none transition-transform active:scale-95">
                                            <Star size={24} className={(hoverRating || rating) >= star ? 'fill-primary text-primary' : 'text-border-neutral'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-charcoal">Experience Message</label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full border border-border-neutral rounded-xl p-4 text-sm focus:border-primary transition-all bg-background-ivory h-40 resize-none outline-none block" placeholder="Share the highlights of your dining experience..." required></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary-hover shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
                                {isSubmitting ? 'Submitting Review...' : 'Submit Post'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center border-t border-border-neutral bg-[#f4efec]">
                <h2 className="text-5xl serif-heading mb-10 text-charcoal">Witness the Excellence</h2>
                <Link to="/booking" className="inline-flex items-center gap-4 bg-charcoal text-white px-12 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all hover:gap-6 shadow-2xl">
                    Reserve Now <ChevronRight size={14} />
                </Link>
            </section>
        </div>
    );
};

export default Feedback;
