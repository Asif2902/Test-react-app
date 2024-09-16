import React, { useEffect, useState } from 'react';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

const WalletConnect = ({ setWalletAddress, setProvider, setSigner }) => {
  const [onboard, setOnboard] = useState(null);
  const [walletAddressDisplay, setWalletAddressDisplay] = useState('Connect Wallet');

  useEffect(() => {
    const injected = injectedModule();
    const walletConnect = walletConnectModule();

    const onboardInstance = Onboard({
      wallets: [injected, walletConnect],
      chains: [
        {
          id: '0x79a', // Minato network ID
          token: 'ETH',
          label: 'Minato',
          rpcUrl: 'https://rpc.minato.soneium.org'
        }
      ]
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

        setWalletAddress(address);
        setProvider(ethersProvider);
        setSigner(signer);
        setWalletAddressDisplay(`${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    }
  };

  return (
    <div className="header">
      <button onClick={connectWallet}>
        {walletAddressDisplay}
      </button>
    </div>
  );
};

export default WalletConnect;
