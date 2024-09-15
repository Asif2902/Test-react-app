import React from 'react';

const WalletConnect = ({ walletAddress, connectWallet }) => {
  return (
    <div className="header">
      <button onClick={connectWallet}>
        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;
