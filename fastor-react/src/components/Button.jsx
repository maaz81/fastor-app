import React from "react";

/**
 * Reusable orange CTA button.
 * Props:
 *  - children
 *  - onClick
 *  - disabled
 *  - loading
 *  - type: "button" | "submit"
 *  - size: "lg" (default, 71px) | "sm" (48px)
 *  - className
 */
export default function Button({
    children,
    onClick,
    disabled = false,
    loading = false,
    type = "button",
    size = "lg",
    className = "",
}) {
    const isDisabled = disabled || loading;
    const heightClass = size === "sm" ? "h-[48px]" : "h-[71px]";
    const textClass = size === "sm" ? "text-[15px]" : "text-[18px]";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={[
                "w-full rounded-[16px]",
                heightClass,
                textClass,
                "text-white font-semibold tracking-wide",
                "transition-colors duration-150",
                isDisabled
                    ? "bg-fastor-orange/50 cursor-not-allowed"
                    : "bg-fastor-orange hover:bg-fastor-orangeDark active:bg-fastor-orangeDark",
                "flex items-center justify-center",
                className,
            ].join(" ")}
        >
            {loading ? (
                <span className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}