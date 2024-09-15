import React from 'react';

const WalletConnect = ({ walletAddress, connectWallet, disconnect }) => {
  return (
    <div className="header">
      {walletAddress ? (
        <>
          <button onClick={disconnect}>
            {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (Disconnect)`}
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;

