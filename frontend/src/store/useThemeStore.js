import { create } from "zustand";

const getInitialTheme = () => {
  return localStorage.getItem("chat-theme") || "dark";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));

// Apply theme immediately on load
document.documentElement.setAttribute("data-theme", getInitialTheme());