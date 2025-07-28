import { useState, useEffect } from "react";

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
    
    if(savedTheme){
      setCurrentTheme(savedTheme)
    }
    else{
      const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setCurrentTheme(defaultTheme)
    }

  }, []);
  
  console.log(currentTheme)

  const themeOptions = themes.map(theme => <option value={theme}>{theme}</option>)
  return (
  <div className="w-full flex justify-between">
    <span>Theme: </span>

    <select 
    data-setting-type="value" 
    onChange={(e) => setTheme(e.target.value)} 
    value={currentTheme}
    className="bg-background text-primary px-4 py-1 border rounded-md ">
      {themeOptions}
    </select>

  </div>);
}