import React, { useEffect, useState } from 'react';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import bitgetWalletModule from '@web3-onboard/bitget';
import metamaskSDK from '@web3-onboard/metamask';
import walletConnectModule from '@web3-onboard/walletconnect'
import okxWallet from '@web3-onboard/okx'
import coinbaseWalletModule from '@web3-onboard/coinbase'

const WalletConnect = ({ setWalletAddress, setProvider, setSigner }) => {
  const [onboard, setOnboard] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false); // Track connection status
  const [walletAddress, setWalletAddressLocal] = useState(''); // Store connected address locally
  const minatoChainId = '0x79a'; // Minato network chain ID

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

const okx = okxWallet()
const coinbaseWalletSdk = coinbaseWalletModule()
const wcInitOptions = {

  projectId: '80860302c6914b5931906382db7c216e',
  requiredChains: [1946],
 
  dappUrl: 'https://stake-meth.vercel.app'
}
const walletConnect = walletConnectModule(wcInitOptions)

const onboardInstance = Onboard({
  wallets: [injected, metamaskSDKWallet, coinbaseWalletSdk, bitgetWallet, walletConnect, okx],
  chains: [
    {
      id: minatoChainId, // Minato network ID
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
  },
  styles: {
    '--w3o-background-color': '#000', /* Black background */
    '--w3o-foreground-color': '#1c1c1c', /* Dark grey for modals */
    '--w3o-text-color': '#fff', /* White text */
    '--w3o-border-color': '#00FFAB', /* Bright green for borders */
    '--w3o-action-color': '#00FFAB', /* Bright green buttons */
    '--w3o-border-radius': '12px', /* Match your UI's border radius */
    '--w3o-font-family': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", /* Match your font */
    '--w3o-action-hover-color': '#00d88b', /* Green on hover */
    '--w3o-box-shadow': '0px 1rem 1.5rem -0.9rem #000000e1' /* Box shadow */
  }
});


    setOnboard(onboardInstance);
  }, []);

  const switchChain = async (provider) => {
    try {
      // Request to switch to the Minato chain
      await provider.send('wallet_switchEthereumChain', [{ chainId: minatoChainId }]);
    } catch (error) {
      // If the chain hasn't been added to the user's wallet, catch the error
      if (error.code === 4902) {
        try {
          // Request to add the Minato chain
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: minatoChainId,
              chainName: 'Minato',
              rpcUrls: ['https://rpc.minato.soneium.org'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://explorer-testnet.soneium.org']
            }
          ]);
        } catch (addError) {
          console.error('Error adding Minato chain to the wallet', addError);
        }
      } else {
        console.error('Error switching chain', error);
      }
    }
  };

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

        // Check if the connected wallet is on the correct chain
        const { chainId } = await ethersProvider.getNetwork();
        if (chainId !== parseInt(minatoChainId, 16)) {
          // If the chain is incorrect, request to switch to the Minato chain
          await switchChain(ethersProvider.provider);
        }
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
