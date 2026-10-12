import React from "react";

/**
 * Phone input with fixed +91 prefix and dash separator, matching Figma.
 * Props:
 *  - value: string (digits only, max 10)
 *  - onChange: (digits) => void
 *  - disabled: boolean
 *  - error: string | null
 */
export default function PhoneInput({ value, onChange, disabled = false, error = null }) {
    const handleChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
        onChange(digits);
    };

    return (
        <div className="w-full">
            <div
                className={[
                    "w-full h-[48px] flex items-center rounded-[10px] px-4",
                    "bg-fastor-inputBg border",
                    error ? "border-fastor-error" : "border-fastor-inputBorder",
                ].join(" ")}
            >
                <span className="text-[16px] font-semibold text-fastor-textPrimary pr-2">
                    +91
                </span>
                <span className="text-fastor-orange font-semibold pr-3">|</span>
                <input
                    type="tel"
                    inputMode="tel"
                    value={value ? `- ${value}` : ""}
                    placeholder="- 00000"
                    onChange={handleChange}
                    disabled={disabled}
                    readOnly={false}
                    className={[
                        "flex-1 bg-transparent outline-none text-[16px]",
                        "text-fastor-textPrimary placeholder:text-fastor-textSecondary",
                        "tracking-wide",
                    ].join(" ")}
                />
            </div>
            {error && (
                <p className="mt-2 text-[13px] text-fastor-error">{error}</p>
            )}
        </div>
    );
}