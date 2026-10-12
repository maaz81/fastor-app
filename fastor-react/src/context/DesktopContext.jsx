import React, { createContext, useContext, useState } from "react";

const DesktopContext = createContext({
    isLaptopMode: false,
    toggleLaptopMode: () => {},
});

export function DesktopProvider({ children }) {
    const [isLaptopMode, setIsLaptopMode] = useState(false);

    const toggleLaptopMode = () => {
        setIsLaptopMode((prev) => !prev);
    };

    return (
        <DesktopContext.Provider value={{ isLaptopMode, toggleLaptopMode }}>
            {children}
        </DesktopContext.Provider>
    );
}

export function useDesktopMode() {
    return useContext(DesktopContext);
}
