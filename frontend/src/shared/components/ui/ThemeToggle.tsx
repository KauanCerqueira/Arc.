"use client";

import { useTheme } from '@/core/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    // Criar overlay de transição
    const overlay = document.createElement('div');
    overlay.className = 'theme-transition-overlay';
    
    // Define a cor baseada no tema atual
    if (theme === 'light') {
      overlay.classList.add('to-dark');
    } else {
      overlay.classList.add('to-light');
    }
    
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Mudar tema no meio da animação
    setTimeout(() => {
      toggleTheme();
    }, 250);

    // Remover overlay após animação
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 600);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600"
      aria-label="Toggle theme"
    >
      {/* Background Circle */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        {/* Icon */}
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}