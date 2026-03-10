import React, { createContext, useContext, useMemo, useState } from "react";

export const lightTheme = {
  background: "#F3F2EF",
  card: "#FFFFFF",
  text: "#0A2540",
  textSecondary: "#666666",
  border: "#EBEBEB",
};

export const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#333333",
};

export type AppTheme = typeof lightTheme;

type ThemeContextValue = {
  isDarkMode: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const value = useMemo(
    () => ({ isDarkMode, theme, toggleTheme }),
    [isDarkMode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
