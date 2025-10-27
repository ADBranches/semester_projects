import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { PacketProvider } from './context/PacketContext';
import { RuleProvider } from './context/RuleContext';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PacketProvider>
        <RuleProvider>
          <App />
        </RuleProvider>
      </PacketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
