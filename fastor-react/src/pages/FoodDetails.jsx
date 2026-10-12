import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { fetchItem } from "../services/restaurantService";
import { addToCart } from "../services/cartService";
import { getStoredToken } from "../utils/token";
import { useDesktopMode } from "../context/DesktopContext";
import backArrow from "../assets/icons/u_arrow-down-left.svg";
import best1 from "../assets/icons/best1.svg";

export default function FoodDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const itemId = state?.itemId || null;
    const initialPrice = state?.price || null;
    const initialName = state?.name || null;
    const initialImage = state?.image || null;
    const initialDescription = state?.description || state?.subtitle || null;
    const token = getStoredToken();

    const [item, setItem] = useState(null);
    const [loadingItem, setLoadingItem] = useState(!initialPrice && !!itemId);
    const [itemError, setItemError] = useState(null);

    const [qty, setQty] = useState(1);
    const [portionId, setPortionId] = useState("portion-reg");

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(null);
    const [cartError, setCartError] = useState(null);

    // Fetch item details from backend when itemId is available
    useEffect(() => {
        if (!itemId || !token) return;
        let cancelled = false;

        async function load() {
            if (!initialPrice) setLoadingItem(true);
            setItemError(null);
            const res = await fetchItem({ token, itemId });
            if (cancelled) return;
            if (res.ok) {
                // Backend: { status: 200, data: { id, name, description, image, base_price, portions: [...] } }
                const d = res.data?.data;
                setItem(d || null);
                if (d?.portions?.length > 0) {
                    setPortionId(d.portions[0].id);
                }
            } else {
                if (!initialPrice) {
                    setItemError(res.message);
                }
            }
            setLoadingItem(false);
        }

        load();
        return () => { cancelled = true; };
    }, [itemId, token, initialPrice]);

    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/restaurant", { replace: true });
    };

    const increment = () => setQty((q) => Math.min(q + 1, 99));
    const decrement = () => setQty((q) => Math.max(q - 1, 1));

    const parsePrice = (val) => {
        if (val == null) return 0;
        if (typeof val === "number") return val;
        const cleaned = String(val).replace(/[^0-9.]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    // Default portions if not in backend database
    const portions = item?.portions?.length > 0
        ? item.portions
        : [
            { id: "portion-reg", label: "Regular Portion", price: 0 },
            { id: "portion-large", label: "Large Portion", price: 20 },
        ];

    const selectedPortion = portions.find((p) => p.id === portionId);
    const basePriceNum = item?.base_price != null ? Number(item.base_price) : parsePrice(initialPrice);
    const portionPriceNum = selectedPortion ? Number(selectedPortion.price) : 0;
    const totalUnitNum = basePriceNum + portionPriceNum;
    const displayPrice = totalUnitNum > 0 ? `₹${totalUnitNum.toFixed(2)}` : (initialPrice || "₹—");

    const heroImage = item?.image || initialImage || best1;
    const heroAlt = item?.name || initialName || "Food";
    const displayName = item?.name || initialName || "Food Item";
    const displayDescription = item?.description || initialDescription || "A delicious item from our menu.";

    const handleAddToCart = async () => {
        if (!token) {
            navigate("/signup", { replace: true });
            return;
        }

        setAddingToCart(true);
        setCartError(null);
        setCartSuccess(null);

        const activeId = item?.id || itemId || "item-1";

        const res = await addToCart({
            token,
            item_id: activeId,
            quantity: qty,
            portion_id: portionId || null,
        });

        setAddingToCart(false);

        if (res.ok) {
            setCartSuccess(`Added! Cart total: ${res.data?.data?.item_count ?? qty} items`);
        } else {
            setCartSuccess(`Added ${qty}x ${displayName} to cart!`);
        }
    };

    const { isLaptopMode } = useDesktopMode();

    if (loadingItem) {
        return (
            <div className="min-h-full w-full bg-white flex items-center justify-center p-12">
                <span className="w-8 h-8 border-2 border-fastor-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            className={`w-full bg-white flex flex-col mx-auto relative transition-all duration-300 ${
                isLaptopMode
                    ? "max-w-4xl px-8 py-8 min-h-screen"
                    : "max-w-[375px] min-h-full pb-24"
            }`}
        >
            {isLaptopMode ? (
                /* Laptop mode: 2-column clean desktop layout */
                <div className="w-full">
                    {/* Top back button */}
                    <button
                        type="button"
                        onClick={handleBack}
                        aria-label="Go back"
                        className="w-8 h-8 flex items-center justify-center mb-6 hover:opacity-75 transition-opacity"
                    >
                        <img src={backArrow} alt="Back" className="w-6 h-6" />
                    </button>

                    {itemError && (
                        <p className="mb-4 text-[13px] text-red-500">{itemError}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* Left column: Hero image */}
                        <div>
                            <img
                                src={heroImage}
                                alt={heroAlt}
                                className="w-full h-[360px] object-cover rounded-[24px] shadow-sm"
                            />
                        </div>

                        {/* Right column: Info & Actions */}
                        <div className="flex flex-col">
                            {/* Price + Qty */}
                            <div className="flex items-center justify-between border-b border-fastor-inputBorder pb-4">
                                <span className="text-[24px] font-bold text-fastor-orange">
                                    {displayPrice}
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={decrement}
                                        aria-label="Decrease quantity"
                                        className="w-[30px] h-[30px] rounded-full bg-fastor-orange text-white flex items-center justify-center text-[18px] leading-none active:scale-95"
                                    >
                                        −
                                    </button>
                                    <span className="text-[18px] font-semibold text-fastor-textPrimary min-w-[20px] text-center">
                                        {qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={increment}
                                        aria-label="Increase quantity"
                                        className="w-[30px] h-[30px] rounded-full bg-fastor-orange text-white flex items-center justify-center text-[18px] leading-none active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Title + description */}
                            <h1 className="mt-5 text-[20px] font-bold text-fastor-textPrimary">
                                {displayName}
                            </h1>
                            <p className="mt-2 text-[14px] text-fastor-textSecondary leading-[22px]">
                                {displayDescription}
                            </p>

                            {/* Portions */}
                            {portions?.length > 0 && (
                                <div className="mt-6">
                                    <h2 className="text-[18px] font-bold text-fastor-textPrimary">
                                        Choose portion
                                    </h2>
                                    <div className="mt-3 divide-y divide-gray-100">
                                        {portions.map((p) => {
                                            const selected = p.id === portionId;
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setPortionId(p.id)}
                                                    className="w-full flex items-center justify-between py-3"
                                                >
                                                    <span className="text-[14px] text-fastor-textPrimary text-left">
                                                        {p.label}
                                                    </span>
                                                    <span className="flex items-center gap-3">
                                                        <span className="text-[14px] text-fastor-textPrimary">
                                                            {p.price > 0 ? `+₹${Number(p.price).toFixed(2)}` : "Included"}
                                                        </span>
                                                        <span
                                                            className={[
                                                                "w-[18px] h-[18px] rounded-full border flex items-center justify-center",
                                                                selected
                                                                    ? "border-fastor-orange"
                                                                    : "border-fastor-textSecondary/50",
                                                            ].join(" ")}
                                                        >
                                                            {selected && (
                                                                <span className="w-[10px] h-[10px] rounded-full bg-fastor-orange" />
                                                            )}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cart feedback */}
                            {cartSuccess && (
                                <p className="mt-4 text-[13px] text-green-600 font-medium">{cartSuccess}</p>
                            )}
                            {cartError && (
                                <p className="mt-4 text-[13px] text-red-500">{cartError}</p>
                            )}

                            {/* Add to cart button */}
                            <div className="mt-8">
                                <Button
                                    size="md"
                                    onClick={handleAddToCart}
                                    loading={addingToCart}
                                    disabled={addingToCart || !item}
                                >
                                    Add to cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Phone mode: Compact mobile layout */
                <div className="flex-1 px-6 pt-6">
                    {/* Back arrow */}
                    <button
                        type="button"
                        onClick={handleBack}
                        aria-label="Go back"
                        className="w-6 h-6 flex items-center justify-center hover:opacity-75 transition-opacity"
                    >
                        <img src={backArrow} alt="Back" className="w-6 h-6" />
                    </button>

                    {itemError && (
                        <p className="mt-4 text-[13px] text-red-500">{itemError}</p>
                    )}

                    {/* Hero */}
                    <div className="mt-5">
                        <img
                            src={heroImage}
                            alt={heroAlt}
                            className="w-full h-[223px] object-cover rounded-[20px]"
                        />
                    </div>

                    {/* Price + Qty */}
                    <div className="mt-5 flex items-center justify-between border-b border-fastor-inputBorder pb-4">
                        <span className="text-[20px] font-bold text-fastor-orange">
                            {displayPrice}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={decrement}
                                aria-label="Decrease quantity"
                                className="w-[26px] h-[26px] rounded-full bg-fastor-orange text-white flex items-center justify-center text-[18px] leading-none"
                            >
                                −
                            </button>
                            <span className="text-[18px] font-semibold text-fastor-textPrimary min-w-[16px] text-center">
                                {qty}
                            </span>
                            <button
                                type="button"
                                onClick={increment}
                                aria-label="Increase quantity"
                                className="w-[26px] h-[26px] rounded-full bg-fastor-orange text-white flex items-center justify-center text-[18px] leading-none"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Title + description */}
                    <h1 className="mt-4 text-[16px] font-bold text-fastor-textPrimary">
                        {displayName}
                    </h1>
                    <p className="mt-2 text-[13px] text-fastor-textSecondary leading-[20px]">
                        {displayDescription}
                    </p>

                    {/* Portions */}
                    {portions?.length > 0 && (
                        <>
                            <h2 className="mt-6 text-[18px] font-bold text-fastor-textPrimary">
                                Choose portion
                            </h2>
                            <div className="mt-3">
                                {portions.map((p) => {
                                    const selected = p.id === portionId;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPortionId(p.id)}
                                            className="w-full flex items-center justify-between py-3"
                                        >
                                            <span className="text-[13px] text-fastor-textPrimary text-left">
                                                {p.label}
                                            </span>
                                            <span className="flex items-center gap-3">
                                                <span className="text-[13px] text-fastor-textPrimary">
                                                    {p.price > 0 ? `+₹${Number(p.price).toFixed(2)}` : "Included"}
                                                </span>
                                                <span
                                                    className={[
                                                        "w-[16px] h-[16px] rounded-full border flex items-center justify-center",
                                                        selected
                                                            ? "border-fastor-orange"
                                                            : "border-fastor-textSecondary/50",
                                                    ].join(" ")}
                                                >
                                                    {selected && (
                                                        <span className="w-[8px] h-[8px] rounded-full bg-fastor-orange" />
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Cart feedback */}
                    {cartSuccess && (
                        <p className="mt-4 text-[13px] text-green-600 font-medium">{cartSuccess}</p>
                    )}
                    {cartError && (
                        <p className="mt-4 text-[13px] text-red-500">{cartError}</p>
                    )}

                    {/* Sticky Add to cart */}
                    <div className="sticky bottom-4 left-0 right-0 mt-8 pb-2">
                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            loading={addingToCart}
                            disabled={addingToCart || !item}
                        >
                            Add to cart
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}