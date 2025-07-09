import Dashboard from './components/Dashboard';
import { useState } from 'react';

function App() {
  const [dbDashBoard, SetdbDashboard] = useState(true)
  
  return (
    <>
      <Dashboard/>
    </>
  )
}

export default App
