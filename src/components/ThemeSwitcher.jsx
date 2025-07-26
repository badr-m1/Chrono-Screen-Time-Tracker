// ThemeSwitcher.jsx
import { useEffect } from 'react';

const themes = ['light', 'dark']; 

export default function ThemeSwitcher() {
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="flex col gap-2 p-4">
      {themes.map((theme) => (
        <button
          key={theme}
          onClick={() => setTheme(theme)}
          className={`px-4 py-2 rounded capitalize 
            ${theme === 'dark' ? 'bg-gray-800 text-white' :  
              'bg-white text-black'}`}
        >
          {theme}
        </button>
      ))}
    </div>
  );
}