import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import CarContextProvider from './context/CarContext.jsx';
import WorldContextProvider from './context/WorldContext.jsx';
// import TestingScene from './test.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorldContextProvider>
      <CarContextProvider>
        <App />
      </CarContextProvider>
    </WorldContextProvider>

    {/* <TestingScene /> */}
  </StrictMode>,
)
