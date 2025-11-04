"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/core/context/ThemeContext";

// Botão no estilo do Square UI, porém usando seu ThemeContext
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Evita mismatch de hidratação
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md size-9 hover:bg-arc-secondary"
        aria-label="Alternar tema"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="relative inline-flex items-center justify-center rounded-md size-9 hover:bg-arc-secondary transition-colors"
    >
      <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
