import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import CarContextProvider from './context/CarContext.jsx';
// import TestingScene from './test.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CarContextProvider>
      <App />
    </CarContextProvider>

    {/* <TestingScene /> */}
  </StrictMode>,
)
