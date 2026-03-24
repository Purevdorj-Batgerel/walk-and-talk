const THEME_KEY = "theme";

export const getTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  // Dispatch a custom event to notify theme changes
  window.dispatchEvent(new CustomEvent("themeChange", { detail: theme }));
};
