import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PhoneInput from "../components/PhoneInput";
import NumericKeypad from "../components/NumericKeypad";
import { registerUser } from "../services/authService";
import { useDesktopMode } from "../context/DesktopContext";
import backArrow from "../assets/icons/u_arrow-down-left.svg";

export default function Signup() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDigit = (d) => {
        if (phone.length >= 10) return;
        setPhone((prev) => (prev + d).slice(0, 10));
        setError(null);
    };

    const handleBackspace = () => {
        setPhone((prev) => prev.slice(0, -1));
        setError(null);
    };

    // Physical keyboard listener
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.target && e.target.tagName === "INPUT") {
                if (e.key === "Enter" && phone.length === 10) {
                    handleGetOtp();
                }
                return;
            }

            if (e.key >= "0" && e.key <= "9") {
                handleDigit(e.key);
            } else if (e.key === "Backspace") {
                handleBackspace();
            } else if (e.key === "Enter" && phone.length === 10) {
                handleGetOtp();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [phone]);

    const handleGetOtp = async () => {
        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setError(null);
        setLoading(true);
        const res = await registerUser({ phone, dial_code: "+91" });
        setLoading(false);

        if (res.ok) {
            const otpCode = res.data?.data?.otp || null;
            if (otpCode) {
                sessionStorage.setItem("fastor_last_otp", otpCode);
            }
            navigate("/verify", { state: { phone, dial_code: "+91", otp: otpCode } });
        } else {
            setError(res.message || "Failed to send OTP. Please try again.");
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
    };

    const { isLaptopMode } = useDesktopMode();

    return (
        <div
            className={`w-full bg-white flex flex-col mx-auto relative transition-all duration-300 ${
                isLaptopMode
                    ? "max-w-[420px] min-h-[100dvh] justify-center px-4 py-8"
                    : "max-w-[375px] min-h-full h-full justify-between"
            }`}
        >
            {/* Top section */}
            <div className="flex-1 px-5 pt-6 sm:pt-8 flex flex-col justify-start">
                {/* Back arrow */}
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="w-6 h-6 flex items-center justify-center hover:opacity-75 transition-opacity"
                >
                    <img src={backArrow} alt="Back" className="w-6 h-6" />
                </button>

                <h1 className="mt-5 text-[24px] font-bold text-fastor-textPrimary">
                    Sign Up to Fastor
                </h1>
                <p className="mt-2 text-[14px] text-fastor-textSecondary leading-[20px]">
                    Let us know your mobile number and we will send you an OTP for verification.
                </p>

                <div className="mt-6 sm:mt-8">
                    <PhoneInput
                        value={phone}
                        onChange={(v) => {
                            setPhone(v);
                            setError(null);
                        }}
                        disabled={loading}
                        error={error}
                    />
                </div>
            </div>

            {/* Bottom CTA + keypad */}
            <div className="w-full mt-4">
                <div className="px-5 pb-2">
                    <Button onClick={handleGetOtp} disabled={phone.length !== 10} loading={loading}>
                        Get OTP
                    </Button>
                    <p className="mt-2 text-[11px] text-center text-fastor-textSecondary leading-[16px]">
                        By clicking, I accept the{" "}
                        <span className="underline">Terms &amp; Conditions</span> and{" "}
                        <span className="underline">Privacy Policy</span>
                    </p>
                </div>
                <NumericKeypad onDigit={handleDigit} onBackspace={handleBackspace} />
            </div>
        </div>
    );
}