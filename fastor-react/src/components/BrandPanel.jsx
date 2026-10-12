import React from "react";

/**
 * Left-side branding panel shown only on laptop/desktop (>= 1024px).
 * Uses only existing Fastor assets — no new files needed.
 */
export default function BrandPanel() {
    return (
        <div className="relative flex flex-col justify-between h-full w-full overflow-hidden bg-fastor-orange text-white px-8 xl:px-12 py-8 xl:py-12 select-none">
            {/* Soft decorative circles — pure CSS, no assets */}
            <div className="pointer-events-none absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-white/10" />
            <div className="pointer-events-none absolute top-1/3 right-10 w-[180px] h-[180px] rounded-full bg-white/5" />

            <div className="relative z-10 flex flex-col justify-between h-full w-full">
                {/* Top — brand */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-sm">
                            <span className="text-fastor-orange font-black text-[20px] leading-none">
                                F
                            </span>
                        </div>
                        <span className="text-[22px] font-bold tracking-wide">Fastor</span>
                    </div>

                    <h1 className="mt-8 xl:mt-12 text-[34px] xl:text-[42px] leading-[42px] xl:leading-[50px] font-extrabold max-w-[500px]">
                        Delicious food,
                        <br />
                        delivered in minutes.
                    </h1>

                    <p className="mt-4 text-[14px] xl:text-[16px] leading-[22px] xl:leading-[26px] text-white/85 max-w-[440px]">
                        Order from your favourite restaurants, track your rider live, and get
                        it hot at your doorstep.
                    </p>
                </div>

                {/* Middle — highlights */}
                <div className="my-6 space-y-3 xl:space-y-4 max-w-[440px]">
                    {[
                        { title: "Fast delivery", sub: "Average 25 min across the city" },
                        { title: "Live tracking", sub: "Watch your order every step" },
                        { title: "Safe & secure", sub: "Verified riders, contactless drop" },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="flex items-start gap-3.5 bg-white/10 rounded-[14px] px-4 py-3 xl:px-5 xl:py-3.5 backdrop-blur-sm"
                        >
                            <div className="w-8 h-8 rounded-[10px] bg-white/20 flex items-center justify-center shrink-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                            </div>
                            <div>
                                <p className="text-[13px] xl:text-[14px] font-semibold">{f.title}</p>
                                <p className="text-[11px] xl:text-[12px] text-white/75 mt-[1px]">{f.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom — footnote */}
                <p className="text-[12px] text-white/70">
                    © {new Date().getFullYear()} Fastor. All rights reserved.
                </p>
            </div>
        </div>
    );
}