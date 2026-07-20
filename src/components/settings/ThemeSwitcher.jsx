import { useState, useEffect } from "react";
import Button from "../ui/Button";

const themes = ["light", "dark"]; 

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(themes[0])
  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme)
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      setTheme(defaultTheme)
    }
  }, [])
  
  const toggleTheme = () => {
    setTheme(currentTheme === "light" ? "dark" : "light");
  };

  return (
    <div className="w-full flex justify-between items-center">
      <span className="text-sm text-base-content/60">
        Theme
      </span>

      <Button
        onClick={toggleTheme}
      >
        {currentTheme === "light" ? "Dark Mode" : "Light Mode"}
      </Button>
    </div>)
}