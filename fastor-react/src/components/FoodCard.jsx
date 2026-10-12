import React from "react";

/**
 * Best Seller carousel card.
 * Props: image, price, onClick
 */
export function BestSellerCard({ image, price = "—", onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative shrink-0 w-[72px] h-[108px] rounded-[10px] overflow-hidden group hover:opacity-95 transition-opacity"
        >
            <img
                src={image}
                alt="Best seller"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute left-0 right-0 bottom-0 bg-black/60 text-white text-[11px] font-medium py-[3px] text-center">
                {price}
            </span>
        </button>
    );
}

/**
 * Popular Items list row.
 * Props: image, title, subtitle, price, qty, statusLabel, statusTone, onClick
 */
export function PopularItemCard({
    image,
    title,
    subtitle,
    price,
    qty,
    statusLabel,
    statusTone = "orange",
    onClick,
}) {
    const statusClasses =
        statusTone === "pink"
            ? "bg-[#FCE9E5] text-[#C4604A]"
            : "bg-fastor-orange text-white";

    return (
        <div
            onClick={onClick}
            className={`flex items-stretch gap-3 py-4 border-b border-fastor-inputBorder ${
                onClick ? "cursor-pointer hover:bg-black/[0.02] transition-colors rounded-lg px-2 -mx-2" : ""
            }`}
        >
            <img
                src={image}
                alt={title}
                className="w-[72px] h-[72px] rounded-[12px] object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-fastor-textPrimary truncate">
                        {title}
                    </h3>
                    <span className="text-[15px] font-semibold text-fastor-orange whitespace-nowrap">
                        {price}
                    </span>
                </div>
                <p className="mt-1 text-[12px] text-fastor-textSecondary">{subtitle}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            if (onClick) {
                                e.stopPropagation();
                                onClick();
                            }
                        }}
                        className={`h-[26px] px-3 rounded-full text-[12px] font-medium active:scale-95 transition-transform ${statusClasses}`}
                    >
                        {statusLabel}
                    </button>
                    <span className="text-[12px] text-fastor-textSecondary whitespace-nowrap">
                        {qty} item
                    </span>
                </div>
            </div>
        </div>
    );
}