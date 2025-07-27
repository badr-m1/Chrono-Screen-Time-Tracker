import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { useState, useEffect } from 'react';

function App() {
  const [viewSettings, SetViewSettings] = useState(false)

   useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if(savedTheme){
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    else{
      const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', defaultTheme)
    }

  }, []);

  return (
    <>
      <button 
      onClick={() => SetViewSettings(val => !val)}
      className='w-fit rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-accent hover:text-accent-text '
      >Settings</button>
      {viewSettings ? <Settings/> : <Dashboard/>}
    </>
  )
}

export default App
