import React from "react";
import { FiDelete } from "react-icons/fi";

/**
 * Custom numeric keypad (Figma style, 3 cols x 4 rows).
 * Props:
 *  - onDigit: (digit: string) => void
 *  - onBackspace: () => void
 */
export default function NumericKeypad({ onDigit, onBackspace }) {
    const keys = [
        { d: "1", sub: "" },
        { d: "2", sub: "ABC" },
        { d: "3", sub: "DEF" },
        { d: "4", sub: "GHI" },
        { d: "5", sub: "JKL" },
        { d: "6", sub: "MNO" },
        { d: "7", sub: "PQRS" },
        { d: "8", sub: "TUV" },
        { d: "9", sub: "WXYZ" },
    ];

    return (
        <div className="w-full bg-fastor-keypadBg pt-3 pb-4 px-2 select-none">
            <div className="grid grid-cols-3 gap-2">
                {keys.map((k) => (
                    <KeyButton key={k.d} digit={k.d} sub={k.sub} onClick={() => onDigit(k.d)} />
                ))}

                {/* Row 4: empty | 0 | backspace */}
                <div />
                <KeyButton digit="0" sub="" onClick={() => onDigit("0")} />
                <button
                    type="button"
                    aria-label="Backspace"
                    onClick={onBackspace}
                    className="h-[48px] rounded-[8px] bg-fastor-keyBg flex items-center justify-center active:bg-gray-200"
                >
                    <FiDelete size={22} className="text-fastor-textPrimary" />
                </button>
            </div>
        </div>
    );
}

function KeyButton({ digit, sub, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-[48px] rounded-[8px] bg-fastor-keyBg flex flex-col items-center justify-center active:bg-gray-200 shadow-sm"
        >
            <span className="text-[20px] font-normal leading-none text-fastor-textPrimary">
                {digit}
            </span>
            {sub && (
                <span className="text-[9px] tracking-[2px] text-fastor-textSecondary mt-[2px]">
                    {sub}
                </span>
            )}
        </button>
    );
}