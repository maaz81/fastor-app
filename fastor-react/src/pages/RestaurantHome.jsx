import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BestSellerCard, PopularItemCard } from "../components/FoodCard";
import { fetchRestaurants } from "../services/restaurantService";
import { getStoredToken, getStoredUser, clearAuthData } from "../utils/token";
import { useDesktopMode } from "../context/DesktopContext";

import callIcon from "../assets/icons/notification.svg";
import msgIcon from "../assets/icons/wallet.svg";
import best1 from "../assets/icons/best1.svg";
import best2 from "../assets/icons/best2.svg";
import best3 from "../assets/icons/best3.svg";
import best4 from "../assets/icons/best4.svg";
import banner from "../assets/icons/banner.svg";
import shake from "../assets/icons/item-shake.svg";
import burger from "../assets/icons/item-burger.svg";

// --- Static Best Seller demo data ---
const BEST_SELLERS = [
    { id: "b1", image: best1, price: "₹103", title: "Special Combo" },
    { id: "b2", image: best2, price: "₹50", title: "Crispy Delight" },
    { id: "b3", image: best3, price: "₹13", title: "Fresh Brew" },
    { id: "b4", image: best4, price: "₹8", title: "Sweet Treat" },
];

// Fallback items shown while loading or when API has no data
const FALLBACK_POPULAR_ITEMS = [
    {
        id: "p1",
        image: shake,
        title: "Strawberry Shake",
        subtitle: "29 Nov, 01:20 pm",
        price: "₹20.00",
        qty: "2",
        statusLabel: "Cancel Order",
        statusTone: "orange",
    },
    {
        id: "p2",
        image: burger,
        title: "Chicken Burger",
        subtitle: "17 Oct, 01:20 pm",
        price: "₹20.00",
        qty: "1",
        statusLabel: "Cancel Order",
        statusTone: "orange",
    },
];

export default function RestaurantHome() {
    const navigate = useNavigate();
    const user = getStoredUser();
    const token = getStoredToken();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

    // Redirect to signup if not authenticated
    useEffect(() => {
        if (!token) {
            navigate("/signup", { replace: true });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            // city_id 118 matches backend test data; make this dynamic when location is available
            const res = await fetchRestaurants({ token, cityId: 118 });
            if (cancelled) return;

            if (res.ok) {
                // Backend: { status: 200, data: [...restaurants] }
                const list = res.data?.data;
                setRestaurants(Array.isArray(list) ? list : []);
            } else {
                setError(res.message);
            }
            setLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, [token]);

    const handleLogout = () => {
        clearAuthData();
        navigate("/signup", { replace: true });
    };

    /**
     * Map a backend restaurant object into PopularItemCard props.
     * Backend shape: { id, name, image, starting_price, rating, delivery_time, cuisine }
     */
    function toPopularCard(r) {
        return {
            id: r.id,
            image: r.image || shake,
            title: r.name || "—",
            subtitle: r.cuisine ? `${r.cuisine} · ${r.delivery_time ?? "—"} min` : (r.delivery_time ?? "—"),
            price: r.starting_price != null ? `₹${Number(r.starting_price).toFixed(2)}` : "—",
            qty: r.rating != null ? `★ ${Number(r.rating).toFixed(1)}` : "—",
            statusLabel: "View Menu",
            statusTone: "orange",
        };
    }

    const displayItems = restaurants.length > 0
        ? restaurants.map(toPopularCard)
        : FALLBACK_POPULAR_ITEMS;

    const { isLaptopMode } = useDesktopMode();

    return (
        <div
            className={`w-full bg-white flex flex-col mx-auto relative transition-all duration-300 pb-8 ${
                isLaptopMode
                    ? "max-w-5xl px-8 py-6"
                    : "max-w-[375px] min-h-full"
            }`}
        >
            {/* Location header */}
            <div className={`flex items-center justify-between ${isLaptopMode ? "px-0 pt-2" : "px-6 pt-6"}`}>
                <div>
                    <p className="text-[12px] text-fastor-textSecondary">Current Location</p>
                    <p className="text-[14px] font-semibold text-fastor-textPrimary mt-[2px]">
                        Model Town, New Delhi
                    </p>
                </div>
                {user?.phone && (
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-fastor-textSecondary">
                            {user.phone}
                        </span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-[11px] text-red-500 underline"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Search + action icons */}
            <div className={`mt-4 flex items-center gap-3 ${isLaptopMode ? "px-0" : "px-6"}`}>
                <div className="flex-1 h-[48px] rounded-[10px] bg-fastor-inputBg flex items-center px-4">
                    <input
                        id="restaurant-search"
                        type="text"
                        placeholder="Search restaurants…"
                        className="flex-1 bg-transparent outline-none text-[15px] text-fastor-textPrimary placeholder:text-fastor-textSecondary"
                    />
                </div>
                <button
                    type="button"
                    className="w-[48px] h-[48px] rounded-[8px] bg-fastor-orange flex items-center justify-center shrink-0"
                    aria-label="Notifications"
                >
                    <img src={callIcon} alt="" className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    className="w-[48px] h-[48px] rounded-[8px] bg-[#2B7BFF] flex items-center justify-center shrink-0"
                    aria-label="Wallet"
                >
                    <img src={msgIcon} alt="" className="w-6 h-6" />
                </button>
            </div>

            {/* Best Seller */}
            <div className="mt-6">
                <h2 className={`text-[18px] font-bold text-fastor-textPrimary ${isLaptopMode ? "px-0" : "px-6"}`}>
                    Best Seller
                </h2>
                <div className={`mt-3 flex gap-3 overflow-x-auto no-scrollbar ${isLaptopMode ? "px-0" : "pl-6"}`}>
                    {BEST_SELLERS.map((b) => (
                        <BestSellerCard
                            key={b.id}
                            image={b.image}
                            price={b.price}
                            onClick={() =>
                                navigate("/food-details", {
                                    state: {
                                        itemId: b.id,
                                        price: b.price,
                                        name: b.title,
                                        image: b.image,
                                    },
                                })
                            }
                        />
                    ))}
                    <div className="w-6 shrink-0" />
                </div>
            </div>

            {/* Promo banner */}
            <div className={`mt-5 ${isLaptopMode ? "px-0" : "px-6"}`}>
                <img
                    src={banner}
                    alt="30% OFF"
                    className={`w-full object-cover rounded-[20px] ${isLaptopMode ? "h-[160px] md:h-[200px]" : "h-[128px]"}`}
                />
            </div>

            {/* Popular Items / Restaurants */}
            <div className={`mt-6 ${isLaptopMode ? "px-0" : "px-6"}`}>
                <h2 className="text-[18px] font-bold text-fastor-textPrimary">
                    {restaurants.length > 0 ? "Restaurants Near You" : "Popular Items"}
                </h2>

                {loading && (
                    <div className="py-8 flex justify-center">
                        <span className="w-6 h-6 border-2 border-fastor-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && error && (
                    <div className="py-4">
                        <p className="text-[13px] text-fastor-error">{error}</p>
                        <p className="text-[11px] text-fastor-textSecondary mt-1">
                            Showing cached items below.
                        </p>
                    </div>
                )}

                {!loading && (
                    <div className={`mt-2 ${isLaptopMode ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col"}`}>
                        {displayItems.map((item) => (
                            <PopularItemCard
                                key={item.id}
                                image={item.image}
                                title={item.title}
                                subtitle={item.subtitle}
                                price={item.price}
                                qty={item.qty}
                                statusLabel={item.statusLabel}
                                statusTone={item.statusTone}
                                onClick={() =>
                                    navigate("/food-details", {
                                        state: {
                                            itemId: item.id,
                                            price: item.price,
                                            name: item.title,
                                            image: item.image,
                                            subtitle: item.subtitle,
                                        },
                                    })
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}