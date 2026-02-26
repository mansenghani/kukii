import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

const FooterSettingsCard = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
        >
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:w-32 group-hover:h-32 transition-all"></div>

            <div className="mb-6 relative">
                <div className="size-16 bg-background-ivory rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <HelpCircle size={32} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-4 border-white"></div>
            </div>

            <h3 className="serif-heading text-2xl text-charcoal mb-3 flex items-center gap-2">
                Footer & Contact
            </h3>

            <p className="text-xs text-soft-grey leading-relaxed mb-8 max-w-[240px] font-medium">
                Update phone numbers, physical address, and linked social media profiles.
            </p>

            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 group-hover:gap-3 transition-all py-2 px-4 rounded-full hover:bg-primary/5">
                Update Info <ArrowRight size={14} />
            </button>
        </div>
    );
};

export default FooterSettingsCard;
