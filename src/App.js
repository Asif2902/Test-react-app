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

  const handleTransactionSuccess = (transactionHash) => {
    setTransactionHash(transactionHash);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
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
          backgroundColor: 'white',
          borderColor: 'black',
          border: '1px solid black',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p style={{ color: 'green', fontSize: '16px', marginBottom: '10px' }}>
            Transaction successful!
          </p>
          <p style={{ fontSize: '14px' }}>
            View on explorer:{" "}
            <a
              href={`https://explorer-testnet.soneium.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {transactionHash}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;