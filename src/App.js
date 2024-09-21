import React, { useState, useEffect } from 'react';

import WalletConnect from './components/WalletConnect';
import StakeSection from './components/StakeSection';
import UnstakeSection from './components/UnstakeSection';
import WithdrawSection from './components/WithdrawSection';

const stakingABI =  [ { "inputs": [ { "internalType": "contract IERC20", "name":
"_rewardToken", "type": "address" }, { "internalType": "address", "name":
"initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type":
"constructor" }, { "anonymous": false, "inputs": [ { "indexed": true,
"internalType": "address", "name": "previousOwner", "type": "address" }, {
"indexed": true, "internalType": "address", "name": "newOwner", "type":
"address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs":
[], "name": "APY", "outputs": [ { "internalType": "uint256", "name": "", "type":
"uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [],
"name": "SECONDS_IN_A_YEAR", "outputs": [ { "internalType": "uint256", "name":
"", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, {
"inputs": [ { "internalType": "address", "name": "_staker", "type": "address" }
], "name": "getReward", "outputs": [ { "internalType": "address", "name": "",
"type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256"
} ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name":
"getTotalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type":
"uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [],
"name": "owner", "outputs": [ { "internalType": "address", "name": "", "type":
"address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [],
"name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable",
"type": "function" }, { "inputs": [], "name": "rewardToken", "outputs": [ {
"internalType": "contract IERC20", "name": "", "type": "address" } ],
"stateMutability": "view", "type": "function" }, { "inputs": [], "name":
"stake", "outputs": [], "stateMutability": "payable", "type": "function" }, {
"inputs": [ { "internalType": "address", "name": "", "type": "address" } ],
"name": "stakers", "outputs": [ { "internalType": "uint256", "name":
"amountStaked", "type": "uint256" }, { "internalType": "uint256", "name":
"lastStakedTime", "type": "uint256" }, { "internalType": "uint256", "name":
"rewardDebt", "type": "uint256" } ], "stateMutability": "view", "type":
"function" }, { "inputs": [], "name": "totalStaked", "outputs": [ {
"internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability":
"view", "type": "function" }, { "inputs": [ { "internalType": "address", "name":
"newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [],
"stateMutability": "nonpayable", "type": "function" }, { "inputs": [ {
"internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name":
"unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
{ "inputs": [], "name": "withdrawReward", "outputs": [], "stateMutability":
"nonpayable", "type": "function" } ]; 
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
  const [transactionHash, setTransactionHash] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (signer) {
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
      setContract(stakingContract);

      const provider = signer.provider;
      provider.on('block', async (blockNumber) => {
        const block = await provider.getBlock(blockNumber);
        if (block && block.transactions) {
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
              handleTransactionSuccess(txHash);
            }
          }
        }
      });

      return () => {
        provider.removeAllListeners('block');
      };
    }
  }, [signer, walletAddress]);
  
const handleTransactionSuccess = async (transactionHash) => {
  // Listen for the transaction to be mined
  provider.once(transactionHash, (receipt) => {
    if (receipt) {
      setTransactionHash(transactionHash);
      setShowAlert(true);

      // Hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  });
};

  const updateTotalStaked = async () => {
    if (contract) {
      try {
        const totalStakedValue = await contract.getTotalStaked();
        const ethPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const totalStakedETH = ethers.utils.formatEther(totalStakedValue);
        setTotalStaked(totalStakedETH);
        setEthInUSD((totalStakedETH * ethPrice.data.ethereum.usd).toFixed(2));
      } catch (error) {
        console.error("Error updating total staked:", error);
      }
    }
  };

  const updateWalletBalance = async () => {
    if (provider && walletAddress) {
      try {
        const balance = await provider.getBalance(walletAddress);
        setWalletBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error updating wallet balance:", error);
      }
    }
  };

  const updateRewards = async () => {
    if (contract && walletAddress) {
      try {
        const [_, reward] = await contract.getReward(walletAddress);
        setRewardAvailable(ethers.utils.formatUnits(reward, 18));
      } catch (error) {
        console.error("Error updating rewards:", error);
      }
    }
  };

  useEffect(() => {
    if (contract) {
      updateTotalStaked();
      updateWalletBalance();
      updateRewards();
    }
  }, [contract, walletAddress]);

  return (
    <div className="container">
      <WalletConnect 
        setWalletAddress={setWalletAddress} 
        setProvider={setProvider} 
        setSigner={setSigner} 
      />
      <h2>Total ETH Staked: {totalStaked} ETH</h2>
      <h2>Total Value: {ethInUSD} USD</h2>
      <h3>Comprehensive APY: 33.40%</h3>
      <StakeSection 
        walletBalance={walletBalance} 
        contract={contract} 
        updateTotalStaked={updateTotalStaked} 
        updateWalletBalance={updateWalletBalance} 
      />
      <UnstakeSection 
        contract={contract} 
        updateTotalStaked={updateTotalStaked} 
        updateWalletBalance={updateWalletBalance} 
        walletAddress={walletAddress} 
      />
      <WithdrawSection 
        contract={contract} 
        updateRewards={updateRewards} 
        rewardAvailable={rewardAvailable} 
      />
      
{showAlert && (
  <div style={{
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0ED49A',
    border: '1px solid #000',
    borderRadius: '10px',
    padding: '15px 20px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
  }}>
    <div>
      <p style={{ fontSize: '16px', margin: '0 0 5px' }}>
        <span style={{ fontWeight: 'bold' }}>Transaction receipt</span>
      </p>
      <p style={{ fontSize: '14px', margin: 0 }}>
        <a
          href={`https://explorer-testnet.soneium.org/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#111', textDecoration: 'underline' }}
        >
          View on Soneium Minato explorer: {transactionHash.slice(0, 6)}...
        </a>
      </p>
    </div>
    <button onClick={() => setShowAlert(false)} style={{
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer',
      marginLeft: '10px',
    }}>X</button>
  </div>
)}

    </div>
  );
}

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const currentMode = localStorage.getItem('mode');
    if (currentMode === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.replace('dark-mode', 'light-mode');
      localStorage.setItem('mode', 'light');
    } else {
      document.body.classList.replace('light-mode', 'dark-mode');
      localStorage.setItem('mode', 'dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <label className="switch">
      <input 
        type="checkbox" 
        checked={darkMode} 
        onChange={toggleDarkMode} 
      />
      <span className="slider">
        <span className="sun">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="#ffd43b">
              <circle r="5" cy="12" cx="12"></circle>
              <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
            </g>
          </svg>
        </span>
        <span className="moon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
          </svg>
        </span>
      </span>
    </label>
  );
};


export default App;