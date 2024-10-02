import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import StakeSection from './components/StakeSection';
import UnstakeSection from './components/UnstakeSection';
import WithdrawSection from './components/WithdrawSection';

const stakingABI = [ { "inputs": [ { "internalType": "contract IERC20", "name": "_rewardToken", "type": "address" }, { "internalType": "address", "name": "initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "APY", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "SECONDS_IN_A_YEAR", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_staker", "type": "address" } ], "name": "getReward", "outputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rewardToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stake", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "stakers", "outputs": [ { "internalType": "uint256", "name": "amountStaked", "type": "uint256" }, { "internalType": "uint256", "name": "lastStakedTime", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
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
    provider.once(transactionHash, (receipt) => {
      if (receipt) {
        setTransactionHash(transactionHash);
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      }
    });
  };

  const updateTotalStaked = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://rpc.minato.soneium.org');
      const contract = new ethers.Contract(stakingContractAddress, stakingABI, provider);

      const totalStakedValue = await contract.getTotalStaked();
      const ethPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const totalStakedETH = ethers.utils.formatEther(totalStakedValue);
      setTotalStaked(totalStakedETH);
      setEthInUSD((totalStakedETH * ethPrice.data.ethereum.usd).toFixed(2));
    } catch (error) {
      console.error("Error updating total staked:", error);
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
    updateTotalStaked(); // Always show total staked ETH and value on load
  }, []);

  useEffect(() => {
    if (contract) {
      updateWalletBalance();
      updateRewards();
    }
  }, [contract, walletAddress]);

  return (
    <div>
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

const ThreeDotMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (e) => {
    if (!e.target.closest(".menu-container")) {
      setIsMenuOpen(false);
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    window.addEventListener("click", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  return (
    <div className="menu-container">
      <button className="menu-btn" onClick={toggleMenu}>
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {isMenuOpen && (
        <div className="menu-content">
          <a href="https://lp-lockers.vercel.app/" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-exchange-alt"></i> P2P
          </a>
          <a href="https://p2-p-marketplace.vercel.app/" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-lock"></i> Token Locker
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
