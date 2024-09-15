import React from 'react';

const WalletConnect = ({ walletAddress, connectWallet, disconnectWallet, connecting }) => {
  return (
    <div className="header">
      {connecting ? (
        <button disabled>Connecting...</button>
      ) : walletAddress ? (
        <>
          <button onClick={disconnectWallet}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} (Disconnect)
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;
