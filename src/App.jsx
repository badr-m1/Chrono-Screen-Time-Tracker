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
      

      {viewSettings && 
      <>
        <div class="flex flex-row-reverse items-end">
          <button 
          onClick={() => SetViewSettings(false)}
          className="w-fit rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-accent hover:text-accent-text"
          >
            Back
          </button>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1> 
        <Settings/>
      </>}

      {!viewSettings && 
      <>
        <div class="flex flex-row-reverse items-end">
          <button 
          onClick={() => SetViewSettings(true)}
          className="w-fit rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-accent hover:text-accent-text"
          >
            Settings
          </button>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your screentime data</h1> 
        <Dashboard/>
      </>}
    </>
  )
}

export default App
