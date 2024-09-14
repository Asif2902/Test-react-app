import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

import { Web3OnboardProvider } from '@web3-onboard/react';

ReactDOM.render(
  <Web3OnboardProvider>
    <App />
  </Web3OnboardProvider>,
  document.getElementById('root')
);
