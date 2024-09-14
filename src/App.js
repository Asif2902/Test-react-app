import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import StakeSection from './components/StakeSection';
import UnstakeSection from './components/UnstakeSection';
import WithdrawSection from './components/WithdrawSection';

import { init, useConnectWallet, useSetChain, useWallets } from
'@web3-onboard/react';
const stakingABI =  [
    {
        "inputs": [
            {
                "internalType": "contract IERC20",
                "name": "_rewardToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "initialOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "APY",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "SECONDS_IN_A_YEAR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_staker",
                "type": "address"
            }
        ],
        "name": "getReward",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalStaked",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardToken",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stake",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "stakers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountStaked",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastStakedTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rewardDebt",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
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

  // Blocknative Onboard initialization
const onboard = init({
  wallets: [
    { walletName: 'metamask', preferred: true },
    { walletName: 'walletConnect', preferred: true },
    { walletName: 'coinbase' }
  ],
  chains: [
    {
      id: '0x79a', // Minato Network Chain ID in hexadecimal (1946 in decimal)
      token: 'ETH',
      label: 'Minato Testnet',
      rpcUrl: 'https://rpc.minato.soneium.org'
    }
  ],
  appMetadata: {
    name: 'My DApp',
    description: 'A simple staking platform',
    icon: '<URL_OF_YOUR_ICON>',
    logo: '<URL_OF_YOUR_LOGO>',
    agreement: {
      version: '1.0.0',
      termsUrl: '<URL_OF_TERMS>',
      privacyUrl: '<URL_OF_PRIVACY_POLICY>'
    }
  }
});

const App = () => {
  // Connect wallet hook
  const [{ wallet }, connect] = useConnectWallet();
  const connectedWallets = useWallets();
  
  // State for balance and provider
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('0');

  // Whenever wallet changes, update provider and fetch balance
  useEffect(() => {
    if (wallet) {
      const ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
      setProvider(ethersProvider);

      const fetchBalance = async () => {
        const walletBalance = await ethersProvider.getBalance(wallet.accounts[0].address);
        setBalance(ethers.utils.formatEther(walletBalance));
      };

      fetchBalance();
    }
  }, [wallet]);

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
