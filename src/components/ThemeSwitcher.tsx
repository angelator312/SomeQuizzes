"use client"
import React, { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  // State to track current theme. Default is 'dark'.
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    // On mount, load saved preference if present
    const saved = typeof window !== 'undefined' ? localStorage.getItem('code-theme') : null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      // Ensure document element reflects saved theme immediately
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Define the CDN links for the stylesheets
    const themes = {
      light: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
      dark: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    };

    // Find the stylesheet link element by ID
    let link = document.getElementById('hljs-theme-link');

    // If it doesn't exist (first load), create it
    if (!link) {
      link = document.createElement('link');
      link.id = 'hljs-theme-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Update the href to the correct theme
    (link as HTMLLinkElement).href = themes[theme];

    // Save preference to localStorage
    localStorage.setItem('code-theme', theme);

    // Toggle global `dark` class so Tailwind `dark:` variants apply consistently
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch a small custom event so same-tab listeners can react immediately
    window.dispatchEvent(new CustomEvent('code-theme-changed', { detail: theme }));
  }, [theme]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
        color: theme === 'dark' ? '#c9d1d9' : '#24292f',
        transition: 'all 0.3s ease',
      }}
    >
      {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
    </button>
  );
};

export default ThemeSwitcher;
