import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("chat-theme") || "dark";
};

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  if (document.body) {
    document.body.dataset.theme = theme;
  }
  const root = document.querySelector("#root");
  if (root) {
    root.dataset.theme = theme;
  }
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-theme", theme);
    }
    applyTheme(theme);
    set({ theme });
  },
}));