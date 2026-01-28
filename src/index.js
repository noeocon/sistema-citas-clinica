import 'bootstrap/dist/css/bootstrap.min.css'; // 1. Estilos de Bootstrap
import './index.css';                         // 2. Tus estilos personalizados
import React from 'react';                    // 3. React
import ReactDOM from 'react-dom/client';      // 4. El motor de React
import App from './App';                      // 5. Tu componente principal

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);