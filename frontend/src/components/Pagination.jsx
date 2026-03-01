import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalRecords, onPageChange, limit = 10 }) => {
    if (totalPages <= 1 && totalRecords === 0) return null;

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endRecord = Math.min(currentPage * limit, totalRecords);

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-border-neutral rounded-b-[2rem]">
            {/* Left side: Showing X to Y of Z entries */}
            <div className="text-[10px] font-bold text-soft-grey uppercase tracking-widest">
                Showing <span className="text-charcoal">{startRecord}</span> to <span className="text-charcoal">{endRecord}</span> of <span className="text-charcoal">{totalRecords}</span> entries
            </div>

            {/* Right side: Pagination Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className={`px-4 py-2 rounded-xl transition-all border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${currentPage === 1
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed bg-gray-50'
                            : 'text-soft-grey border-border-neutral hover:bg-primary/5 hover:text-primary bg-white shadow-sm'
                        }`}
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest">
                    Page {currentPage} of {totalPages || 1}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Next page"
                    className={`px-4 py-2 rounded-xl transition-all border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${currentPage === totalPages || totalPages === 0
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed bg-gray-50'
                            : 'text-soft-grey border-border-neutral hover:bg-primary/5 hover:text-primary bg-white shadow-sm'
                        }`}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
