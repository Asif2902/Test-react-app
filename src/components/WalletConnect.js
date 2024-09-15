import React, { useState, useEffect } from 'react';
import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';


const WalletConnect = ({ setWalletAddress, setSigner, setProvider }) => {
  const [connectedWallets, setConnectedWallets] = useState([]);

  // Injected and WalletConnect modules for MetaMask and WalletConnect
  const injected = injectedModule();
  const walletConnect = walletConnectModule();

  // Initialize Onboard with injected and walletConnect modules
  const onboard = init({
    wallets: [injected, walletConnect],
    chains: [{
      id: '0x79a', 
      token: 'ETH', 
      label: 'Minato', 
      rpcUrl: 'https://rpc.minato.soneium.org'
    }]
  });

  useEffect(() => {
    if (connectedWallets.length) {
      const walletProvider = new ethers.providers.Web3Provider(connectedWallets[0].provider);
      const walletSigner = walletProvider.getSigner();
      walletSigner.getAddress().then((address) => setWalletAddress(address));
      setSigner(walletSigner);
      setProvider(walletProvider);
    }
  }, [connectedWallets, setWalletAddress, setSigner, setProvider]);

  const connectWallet = async () => {
    const wallets = await onboard.connectWallet();
    setConnectedWallets(wallets);
  };

  return (
    <div className="header">
      <button onClick={connectWallet}>
        {connectedWallets.length ? 
          `${connectedWallets[0].accounts[0].address.slice(0, 6)}...${connectedWallets[0].accounts[0].address.slice(-4)}` : 
          'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;
