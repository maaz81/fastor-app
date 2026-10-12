import React, { useRef, useEffect } from "react";

/**
 * 6-box OTP display matching Figma: 3 boxes | dash | 3 boxes.
 * Props:
 *  - value: string of up to 6 digits
 *  - onChange: (val: string) => void
 *  - error: string | null
 *  - autoFocus: boolean
 */
export default function OtpInput({
    value = "",
    onChange,
    error = null,
    autoFocus = true,
}) {
    const inputRef = useRef(null);
    const digits = (value || "").split("");
    const activeIndex = digits.length; // next empty box index

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleBoxClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
        if (onChange) {
            onChange(val);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (onChange) {
            onChange(pasted);
        }
    };

    const Box = ({ index }) => {
        const digit = digits[index] || "";
        const isActive = index === activeIndex && activeIndex < 6;

        return (
            <div
                className={[
                    "w-[46px] h-[52px] rounded-[8px] flex items-center justify-center",
                    "border transition-colors",
                    error
                        ? "border-fastor-error"
                        : isActive
                        ? "border-fastor-orange"
                        : "border-fastor-inputBorder",
                ].join(" ")}
            >
                {digit ? (
                    <span className="text-[22px] font-medium text-fastor-textPrimary">
                        {digit}
                    </span>
                ) : isActive ? (
                    <span className="w-[2px] h-5 bg-fastor-orange rounded-sm animate-pulse" />
                ) : null}
            </div>
        );
    };

    return (
        <div className="relative">
            {/* Transparent accessible input covering the boxes for native keyboard & paste support */}
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={value}
                onChange={handleInputChange}
                onPaste={handlePaste}
                className="absolute inset-0 w-full h-[52px] opacity-0 cursor-pointer z-10"
                aria-label="6-digit verification code"
            />

            {/* Visual 6-box presentation */}
            <div
                onClick={handleBoxClick}
                className="flex items-center justify-between w-full cursor-pointer"
            >
                <div className="flex gap-3">
                    <Box index={0} />
                    <Box index={1} />
                    <Box index={2} />
                </div>

                <span className="text-fastor-textSecondary text-[18px]">-</span>

                <div className="flex gap-3">
                    <Box index={3} />
                    <Box index={4} />
                    <Box index={5} />
                </div>
            </div>

            {error && <p className="mt-2 text-[13px] text-fastor-error">{error}</p>}
        </div>
    );
}