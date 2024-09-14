import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Onboard } from '@web3-onboard/react';
import { chains } from './chains';
import './styles.css';

const onboard = Onboard({
  chains,
  wallets: [
    { name: 'MetaMask', wallets: ['metamask'] },
    { name: 'WalletConnect', wallets: ['walletConnect'] },
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <Onboard>
      <App />
    </Onboard>
  </React.StrictMode>,
  document.getElementById('root')
);