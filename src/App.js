import React from 'react';
import AppRoutes from "./Routes";
import { UserFormProvider } from './context/UserFormContext';
import TopFileBar from './components/TopFileBar';
import { ToastContainer } from 'react-toastify';
import './App.css';

function App() {
  return (
    <UserFormProvider>

      <AppRoutes />
      <ToastContainer 
        autoClose={3000}
        hideProgressBar={true}
        theme='colored'
      />
    </UserFormProvider>
  );
}

export default App;
