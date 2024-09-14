import React, { useState, useEffect } from 'react';
import { init, useConnectWallet, Web3OnboardProvider } from '@web3-onboard/react';
;
import './styles.css';

// Initialize Onboard.js
const onboard = init({
  wallets: [
    { walletName: 'metamask', preferred: true },
    { walletName: 'walletConnect', rpc: { 1: 'https://rpc.minato.soneium.org' } }
  ],
  chains: [
    {
      id: '0x79a', // 1946 in hexadecimal
      token: 'ETH',
      label: 'Minato Testnet',
      rpcUrl: 'https://rpc.minato.soneium.org'
    }
  ],
  appMetadata: {
    name: 'Staking Platform',
    description: 'Stake your ETH and earn rewards',
    icon: '<svg>YourIconHere</svg>',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ]
  }
});

function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [totalStaked, setTotalStaked] = useState('0');
  const [ethPrice, setEthPrice] = useState('0');
  const [balance, setBalance] = useState('0');
  const [reward, setReward] = useState('0');

  
const stakingABI = [ { "inputs": [ { "internalType": "contract IERC20", "name": "_rewardToken", "type": "address" }, { "internalType": "address", "name": "initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "APY", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "SECONDS_IN_A_YEAR", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_staker", "type": "address" } ], "name": "getReward", "outputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rewardToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stake", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "stakers", "outputs": [ { "internalType": "uint256", "name": "amountStaked", "type": "uint256" }, { "internalType": "uint256", "name": "lastStakedTime", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]; const stakingContractAddress = '0xcE3E021038C4f62209EFf23f1d2D3B3EbE83b600';

  useEffect(() => {
    if (wallet?.provider) {
      const ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
      const ethersSigner = ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      ethersSigner.getAddress().then(setWalletAddress);
    }
  }, [wallet]);

  useEffect(() => {
    if (provider && signer && walletAddress) {
      updateTotalStaked();
      updateWalletBalance();
      updateRewards();
    }
  }, [provider, signer, walletAddress]);

  const updateTotalStaked = async () => {
    const contract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    const totalStaked = await contract.getTotalStaked();
    const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    setTotalStaked(ethers.utils.formatEther(totalStaked));
    setEthPrice((ethers.utils.formatEther(totalStaked) * ethPriceResponse.data.ethereum.usd).toFixed(2));
  };

  const updateWalletBalance = async () => {
    const balance = await provider.getBalance(walletAddress);
    setBalance(ethers.utils.formatEther(balance));
  };

  const updateRewards = async () => {
    const contract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    const [_, reward] = await contract.getReward(walletAddress);
    setReward(ethers.utils.formatUnits(reward, 18));
  };

  const stake = async () => {
    const contract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    const stakeAmount = document.getElementById("stakeAmount").value;
    const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
    await contract.stake({ value: stakeAmountWei });
    updateTotalStaked();
    updateWalletBalance();
  };

  const unstake = async () => {
    const contract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    const stakerData = await contract.stakers(walletAddress);
    const stakedAmount = stakerData.amountStaked;
    await contract.unstake(stakedAmount);
    updateTotalStaked();
    updateWalletBalance();
  };

  const withdrawReward = async () => {
    const contract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    await contract.withdrawReward();
    updateRewards();
  };

  return (
    <div className="App">
      <header className="header">
        {wallet ? (
          <>
            <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <button onClick={() => disconnect(wallet)}>Disconnect</button>
          </>
        ) : (
          <button onClick={connect}>{connecting ? 'Connecting...' : 'Connect Wallet'}</button>
        )}
      </header>

      <div className="container">
        <h2>Total ETH Staked: {totalStaked} ETH</h2>
        <h2>Total Value: {ethPrice} USD</h2>
        <h3>Comprehensive APY: 33.40%</h3>

        <div className="stake-section">
          <h3>Stake ETH</h3>
          <p>Your Balance: {balance} ETH</p>
          <input type="number" id="stakeAmount" placeholder="Enter amount" />
          <button onClick={stake}>Stake</button>
        </div>

        <div className="unstake-section">
          <h3>Unstake ETH</h3>
          <button onClick={unstake}>Unstake All</button>
        </div>

        <div className="withdraw-section">
          <h3>Withdraw Rewards</h3>
          <p>Reward Available: {reward} Tokens</p>
          <button onClick={withdrawReward}>Withdraw</button>
        </div>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Web3OnboardProvider onboard={onboard}>
      <App />
    </Web3OnboardProvider>
  );
}
