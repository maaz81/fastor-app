import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import OtpInput from "../components/OtpInput";
import NumericKeypad from "../components/NumericKeypad";
import { loginUser, registerUser } from "../services/authService";
import { storeAuthData } from "../utils/token";
import { useDesktopMode } from "../context/DesktopContext";
import backArrow from "../assets/icons/u_arrow-down-left.svg";

const RESEND_SECONDS = 30;

export default function VerifyOtp() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const phone = state?.phone || "";
    const dialCode = state?.dial_code || "+91";

    const [otp, setOtp] = useState("");
    const [devOtp, setDevOtp] = useState(
        state?.otp || sessionStorage.getItem("fastor_last_otp") || ""
    );
    const [otpBannerSeconds, setOtpBannerSeconds] = useState(60);
    const [showOtpBanner, setShowOtpBanner] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
    const [resending, setResending] = useState(false);

    const timerRef = useRef(null);

    // 1-minute timer to hide the window top-center OTP banner after 60 seconds
    useEffect(() => {
        if (!devOtp) {
            setShowOtpBanner(false);
            return;
        }
        setShowOtpBanner(true);
        setOtpBannerSeconds(60);

        const bannerInterval = setInterval(() => {
            setOtpBannerSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(bannerInterval);
                    setShowOtpBanner(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(bannerInterval);
    }, [devOtp]);

    // Countdown timer for Resend button
    useEffect(() => {
        if (secondsLeft <= 0) return;
        timerRef.current = setTimeout(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearTimeout(timerRef.current);
    }, [secondsLeft]);

    // If user landed here without phone (e.g. refresh), bounce to signup
    useEffect(() => {
        if (!phone) navigate("/signup", { replace: true });
    }, [phone, navigate]);

    const handleDigit = (d) => {
        if (otp.length >= 6) return;
        setOtp((prev) => (prev + d).slice(0, 6));
        setError(null);
    };

    const handleBackspace = () => {
        setOtp((prev) => prev.slice(0, -1));
        setError(null);
    };

    // Physical keyboard listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            // If focus is inside an input, only handle Enter for submit
            if (e.target && e.target.tagName === "INPUT") {
                if (e.key === "Enter" && otp.length === 6) {
                    handleContinue();
                }
                return;
            }

            if (e.key >= "0" && e.key <= "9") {
                handleDigit(e.key);
            } else if (e.key === "Backspace") {
                handleBackspace();
            } else if (e.key === "Enter" && otp.length === 6) {
                handleContinue();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [otp]);

    const handleContinue = async () => {
        if (otp.length !== 6) {
            setError("Please enter the 6-digit code.");
            return;
        }
        setError(null);
        setLoading(true);

        const res = await loginUser({ phone, otp, dial_code: dialCode });

        setLoading(false);

        if (res.ok) {
            // Backend response: { status: 200, data: { token, user: { id, phone, dial_code } } }
            sessionStorage.removeItem("fastor_last_otp");
            storeAuthData(res.data);
            navigate("/restaurant", { replace: true });
        } else {
            setError(res.message || "Invalid OTP. Please try again.");
        }
    };

    const handleResend = async () => {
        if (secondsLeft > 0 || resending) return;
        setResending(true);
        setError(null);

        const res = await registerUser({ phone, dial_code: dialCode });

        setResending(false);

        if (res.ok) {
            setOtp("");
            setSecondsLeft(RESEND_SECONDS);
            const newOtp = res.data?.data?.otp;
            if (newOtp) {
                sessionStorage.setItem("fastor_last_otp", newOtp);
                setDevOtp(newOtp);
                setOtpBannerSeconds(60);
                setShowOtpBanner(true);
            }
        } else {
            setError(res.message || "Failed to resend code.");
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/signup", { replace: true });
    };

    const formatTimer = (s) => {
        const m = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${m}:${ss}`;
    };

    const { isLaptopMode } = useDesktopMode();

    return (
        <>
            {/* ── Window Top-Center Floating Verification Code Banner (1-min timer) ── */}
            {showOtpBanner && devOtp && (
                <div
                    aria-label="Verification Code Notification"
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-auto"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setOtp(devOtp);
                            setError(null);
                        }}
                        title="Click to auto-fill code"
                        className="group flex items-center gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-md border border-fastor-orange/35 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(255,107,0,0.22)] hover:border-fastor-orange transition-all cursor-pointer active:scale-95"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-fastor-orange animate-pulse shrink-0" />
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-fastor-textSecondary">
                                Verification Code:
                            </span>
                            <span className="text-[17px] font-black tracking-widest text-fastor-orange font-mono select-all">
                                {devOtp}
                            </span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-200" />
                        <span className="text-[12px] font-semibold text-fastor-orange underline group-hover:text-fastor-orange">
                            Auto-fill
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-fastor-orange border border-fastor-orange/20 font-mono">
                            {otpBannerSeconds}s
                        </span>
                    </button>
                </div>
            )}

            <div
                className={`w-full bg-white flex flex-col mx-auto relative transition-all duration-300 ${
                    isLaptopMode
                        ? "max-w-[420px] min-h-[100dvh] justify-center px-4 py-8"
                        : "max-w-[375px] min-h-full h-full justify-between"
                }`}
            >
                {/* Top */}
                <div className="flex-1 px-5 pt-6 sm:pt-8 flex flex-col justify-start">
                    <button
                        type="button"
                        onClick={handleBack}
                        aria-label="Go back"
                        className="w-6 h-6 flex items-center justify-center hover:opacity-75 transition-opacity"
                    >
                        <img src={backArrow} alt="Back" className="w-6 h-6" />
                    </button>

                    <h1 className="mt-5 text-[24px] font-bold text-fastor-textPrimary">
                        6-digit code
                    </h1>
                    <p className="mt-2 text-[14px] text-fastor-textSecondary leading-[20px]">
                        Please enter the code we&apos;ve sent to
                    </p>
                    <p className="mt-1 text-[14px] font-bold text-fastor-textPrimary">
                        {dialCode} {phone}
                    </p>

                    <div className="mt-6 sm:mt-8">
                        <OtpInput
                            value={otp}
                            onChange={(val) => {
                                setOtp(val);
                                setError(null);
                            }}
                            error={error}
                        />
                    </div>

                    <div className="mt-5">
                        {secondsLeft > 0 ? (
                            <p className="text-[13px] text-fastor-textPrimary">
                                I didn&apos;t receive a code{" "}
                                <span className="text-fastor-orange font-semibold">
                                    ({formatTimer(secondsLeft)})
                                </span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-[13px] font-semibold text-fastor-orange underline disabled:opacity-60"
                            >
                                {resending ? "Resending..." : "Resend code"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom CTA + keypad */}
                <div className="w-full mt-4">
                    <div className="px-5 pb-2">
                        <Button
                            onClick={handleContinue}
                            disabled={otp.length !== 6}
                            loading={loading}
                        >
                            Continue
                        </Button>
                    </div>
                    <NumericKeypad onDigit={handleDigit} onBackspace={handleBackspace} />
                </div>
            </div>
        </>
    );
}