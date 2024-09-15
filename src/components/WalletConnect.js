import React, { useState } from 'react';
import Onboard from '@web3-onboard/react';

const onboard = Onboard({
  wallets: [
    {
      walletName: 'metamask',
      preferred: true
    },
    {
      walletName: 'walletConnect',
      rpc: {
        1: 'https://mainnet.infura.io/v3/b70e346a23714105a785fa4ce3b90aa5'
      }
    }
  ],
  chains: [
    {
      id: '0x79a', // Ethereum Mainnet
      token: 'ETH',
      label: 'Minato Testnet',
      rpcUrl: 'https://rpc.minato.soneium.org'
    }
  ]
});

const WalletConnect = () => {
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    const wallets = await onboard.connectWallet();
    setWallet(wallets[0]);
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {wallet ? `Connected: ${wallet.accounts[0].address}` : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;
