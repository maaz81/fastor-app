import React from "react";
import BrandPanel from "./BrandPanel";
import { useDesktopMode } from "../context/DesktopContext";

/**
 * DesktopShell
 * - Below 1024px : full-screen mobile app (no frame, no brand panel).
 * - 1024px+      :
 *   • Split mode (default): Left brand panel + right centered mobile phone preview.
 *   • Laptop port mode (after clicking left arrow): Full-width laptop desktop view for restaurant & routes.
 *
 * Floating toggle button:
 * - Split mode: points LEFT (◀) to collapse the left panel into laptop mode.
 * - Laptop mode: points RIGHT (▶) to expand the brand panel back into split mode.
 */
export default function DesktopShell({ children }) {
    const { isLaptopMode, toggleLaptopMode } = useDesktopMode();

    return (
        <div className="min-h-[100dvh] w-full flex bg-white lg:bg-[#F2F2F7] overflow-x-hidden">
            {/* ── Left Brand Panel (laptop/desktop only) ── */}
            <aside
                aria-label="Brand Overview"
                className={`hidden lg:block h-screen max-h-[100dvh] shrink-0 transition-all duration-500 ease-in-out overflow-hidden z-10 ${
                    isLaptopMode
                        ? "w-0 opacity-0 pointer-events-none"
                        : "w-[45%] xl:w-[50%] opacity-100"
                }`}
            >
                <BrandPanel />
            </aside>

            {/* ── Floating Left / Right Arrow Toggle Button (laptop/desktop only) ── */}
            <div className="hidden lg:block">
                <button
                    type="button"
                    onClick={toggleLaptopMode}
                    aria-label={isLaptopMode ? "Show brand panel" : "Convert to laptop view"}
                    title={isLaptopMode ? "Show brand panel" : "Convert to laptop view"}
                    className={`fixed top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-9 h-14 rounded-full bg-white shadow-[0_4px_22px_rgba(0,0,0,0.16)] ring-1 ring-black/10 text-fastor-orange hover:bg-fastor-orange hover:text-white transition-all duration-500 active:scale-95 ${
                        isLaptopMode
                            ? "left-4"
                            : "left-[calc(45%-18px)] xl:left-[calc(50%-18px)]"
                    }`}
                >
                    {/* SVG arrow: points LEFT (rotate-0) in split mode, rotates 180° to point RIGHT in laptop mode */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-4 h-4 transition-transform duration-500 ${
                            isLaptopMode ? "rotate-180" : "rotate-0"
                        }`}
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            </div>

            {/* ── App Content Area ── */}
            <main
                className={`flex-1 transition-all duration-500 min-h-[100dvh] flex flex-col justify-center items-center ${
                    isLaptopMode
                        ? "w-full bg-white p-0"
                        : "w-full bg-white lg:bg-[#F2F2F7] lg:p-4 lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden"
                }`}
            >
                {/* Frame wrapper */}
                <div
                    className={`w-full transition-all duration-500 ${
                        isLaptopMode
                            ? "w-full min-h-[100dvh] bg-white overflow-y-auto"
                            : "lg:w-[375px] lg:max-w-[375px] lg:h-[min(780px,calc(100vh-2rem))] lg:bg-white lg:rounded-[36px] lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22)] lg:ring-1 lg:ring-black/10 lg:relative lg:overflow-hidden flex flex-col"
                    }`}
                >
                    {/* Inner content scroll container */}
                    <div
                        className={`w-full flex-1 ${
                            isLaptopMode
                                ? ""
                                : "lg:overflow-y-auto lg:no-scrollbar"
                        }`}
                    >
                        {children}
                    </div>

                    {/* iOS Home Indicator: only rendered in split phone mockup mode */}
                    {!isLaptopMode && (
                        <div className="hidden lg:block pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black/80" />
                    )}
                </div>
            </main>
        </div>
    );
}