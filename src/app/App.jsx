import Button from '..//components/ui/Button';
import Dashboard from '../components/dashboard/Dashboard';
import Settings from '../components/settings/Settings';
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
      
        <h1 className="text-4xl font-bold text-base-content border-base-content/8 bg-surface border-1 rounded-sm p-1">Settings</h1> 

        <Settings/>
        
        <div class="flex justify-center m-1">
          <Button 
          onClick={() => SetViewSettings(false)}
          className="w-fit rounded-md px-2 py-2 bg-accent text-accent-content hover:bg-accent-active hover:text-accent-content"
          >
            Back
          </Button>
        </div>
        
      </>}

      {!viewSettings && 
      <>
        <h1 className="text-4xl font-bold text-base-content border-base-content/8 bg-surface border-1 rounded-sm p-1">Screen Time</h1> 

        <Dashboard/>

        <div class="flex justify-center">
          <Button onClick={() => SetViewSettings(true)}>
            ⚙ Settings
          </Button>
        </div>

      </>}
    </>
  )
}

export default App
