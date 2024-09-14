import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { chains } from './chains';
import './styles.css';

const onboard = {
  chains,
  wallets: [
    { name: 'MetaMask', wallets: ['metamask'] },
    { name: 'WalletConnect', wallets: ['walletConnect'] },
  ],
};

ReactDOM.render(
  <React.StrictMode>
    <Web3OnboardProvider {...onboard}>
      <App />
    </Web3OnboardProvider>
  </React.StrictMode>,
  document.getElementById('root')
);