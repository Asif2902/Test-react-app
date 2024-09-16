import React, { useEffect, useState } from 'react';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import bitgetWalletModule from '@web3-onboard/bitget';
import metamaskSDK from '@web3-onboard/metamask'; // Assuming you have this module installed
import { ethers } from 'ethers';

const WalletConnect = ({ setWalletAddress, setProvider, setSigner }) => {
  const [onboard, setOnboard] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false); // Track connection status
  const [walletAddress, setWalletAddressLocal] = useState(''); // Store connected address locally

  useEffect(() => {
    const injected = injectedModule();
    const bitgetWallet = bitgetWalletModule();
    const metamaskSDKWallet = metamaskSDK({
      options: {
        extensionOnly: false,
        dappMetadata: {
          name: 'Eth staking'
        }
      }
    });

    const onboardInstance = Onboard({
      wallets: [injected, metamaskSDKWallet, bitgetWallet],
      chains: [
        {
          id: '0x79a', // Minato network ID
          token: 'ETH',
          label: 'Minato',
          rpcUrl: 'https://rpc.minato.soneium.org'
        }
      ],
      appMetadata: {
        name: 'Staking App',
        icon: 'https://i.ibb.co.com/VJH23rF/logo-2.png',
        logo: 'https://i.ibb.co.com/VJH23rF/logo-2.png',
        description: 'An ETH staking platform on the Minato chain',
        recommendedInjectedWallets: [
          { name: 'MetaMask', url: 'https://metamask.io' }
        ]
      }
    });

    setOnboard(onboardInstance);
  }, []);

  const connectWallet = async () => {
    if (onboard) {
      const wallets = await onboard.connectWallet();
      if (wallets.length > 0) {
        const wallet = wallets[0];
        const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any');
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();

        setWalletAddress(address); // Send to parent component
        setProvider(ethersProvider);
        setSigner(signer);
        setWalletAddressLocal(address); // Store locally
        setWalletConnected(true); // Set wallet as connected
      }
    }
  };

  return (
    <div className="header">
      <button onClick={connectWallet}>
        {walletConnected ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;
