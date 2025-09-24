import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'dotenv/config';
import { database } from './config/database';

// Initialize database connection
const initializeApp = async () => {
  try {
    await database.connect();
    console.log('🚀 App initialized with database connection');
  } catch (error) {
    console.warn('⚠️  App starting without database connection:', error);
  }
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Start the app
initializeApp();
