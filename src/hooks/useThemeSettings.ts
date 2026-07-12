import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type MetallicTheme = "gold" | "silver" | "copper" | "crystal";

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("theme") as ThemeMode) || "dark";
    } catch {
      return "dark";
    }
  });

  const [metallicTheme, setMetallicTheme] = useState<MetallicTheme>(() => {
    try {
      return (localStorage.getItem("metallicTheme") as MetallicTheme) || "gold";
    } catch {
      return "gold";
    }
  });

  const updateTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (_) { }
  };

  const toggleTheme = () => {
    updateTheme(theme === "dark" ? "light" : "dark");
  };

  const changeMetallicTheme = (metal: MetallicTheme) => {
    setMetallicTheme(metal);
    try {
      localStorage.setItem("metallicTheme", metal);
    } catch (_) { }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("metal-gold", "metal-silver", "metal-copper");
    root.classList.add(`metal-${metallicTheme}`);
  }, [metallicTheme]);

  const getBoxLinerClass = (forceGold: boolean = false) => {
    if (forceGold) return "gold-liner-box";
    if (metallicTheme === "silver") return "silver-liner-box";
    if (metallicTheme === "copper") return "copper-liner-box";
    if (metallicTheme === "crystal") return "crystal-liner-box";
    return "gold-liner-box";
  };

  return {
    theme,
    setTheme: updateTheme,
    metallicTheme,
    setMetallicTheme,
    toggleTheme,
    changeMetallicTheme,
    getBoxLinerClass,
    isLight: theme === "light",
  };
}
