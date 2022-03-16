import React from 'react';
import logo from './logo.svg';
import './App.css';

import { AppLoadingOverlay } from './components/AppLoadingOverlay';
import { Home } from './pages/Home';

import { ToastContainer } from 'react-toastify';

const App = () => {
  return <>
    <Home />
    <ToastContainer />
  </>
};

export default App;
