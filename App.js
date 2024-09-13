import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import StakeSection from './components/StakeSection';
import UnstakeSection from './components/UnstakeSection';
import WithdrawSection from './components/WithdrawSection';
import { ethers } from 'ethers';
import axios from 'axios';

const stakingABI = [ /*... ABI code ...*/ ];
const stakingContractAddress = '0xcE3E021038C4f62209EFf23f1d2D3B3EbE83b600';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [totalStaked, setTotalStaked] = useState('0');
  const [ethInUSD, setEthInUSD] = useState('0');
  const [walletBalance, setWalletBalance] = useState('0');
  const [rewardAvailable, setRewardAvailable] = useState('0');

  const minatoNetwork = {
    chainId: '0x79a',
    chainName: 'Minato',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.minato.soneium.org'],
    blockExplorerUrls: ['https://explorer-testnet.soneium.org']
  };

  // Wallet Connection Logic
  async function connectWallet() {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      await newProvider.send('eth_requestAccounts', []);
      const newSigner = newProvider.getSigner();
      const walletAddr = await newSigner.getAddress();
      await switchToMinatoNetwork(newProvider);
      setProvider(newProvider);
      setSigner(newSigner);
      setWalletAddress(walletAddr);
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingABI, newSigner);
      setContract(stakingContract);
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  }

  // Switch to Minato Network
  async function switchToMinatoNetwork(provider) {
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: minatoNetwork.chainId }]);
    } catch (error) {
      if (error.code === 4902) {
        await provider.send('wallet_addEthereumChain', [minatoNetwork]);
      }
    }
  }

  // Fetch total staked and ETH price from CoinGecko
  async function updateTotalStaked() {
    if (contract) {
      const totalStakedValue = await contract.getTotalStaked();
      const ethPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const totalStakedETH = ethers.utils.formatEther(totalStakedValue);
      setTotalStaked(totalStakedETH);
      setEthInUSD((totalStakedETH * ethPrice.data.ethereum.usd).toFixed(2));
    }
  }

  // Fetch Wallet Balance
  async function updateWalletBalance() {
    if (provider && walletAddress) {
      const balance = await provider.getBalance(walletAddress);
      setWalletBalance(ethers.utils.formatEther(balance));
    }
  }

  // Fetch Rewards
  async function updateRewards() {
    if (contract && walletAddress) {
      const [_, reward] = await contract.getReward(walletAddress);
      setRewardAvailable(ethers.utils.formatUnits(reward, 18));
    }
  }

  useEffect(() => {
    if (contract) {
      updateTotalStaked();
      updateWalletBalance();
      updateRewards();
    }
  }, [contract]);

  return (
    <div className="container">
      <WalletConnect walletAddress={walletAddress} connectWallet={connectWallet} />
      <h2>Total ETH Staked: {totalStaked} ETH</h2>
      <h2>Total Value: {ethInUSD} USD</h2>
      <h3>Comprehensive APY: 33.40%</h3>
      <StakeSection walletBalance={walletBalance} contract={contract} updateTotalStaked={updateTotalStaked} updateWalletBalance={updateWalletBalance} />
      <UnstakeSection contract={contract} updateTotalStaked={updateTotalStaked} updateWalletBalance={updateWalletBalance} />
      <WithdrawSection contract={contract} updateRewards={updateRewards} rewardAvailable={rewardAvailable} />
    </div>
  );
}

export default App;
