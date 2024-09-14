import React, { useState } from 'react';

const StakeSection = ({ walletBalance, contract, updateTotalStaked, updateWalletBalance }) => {
  const [stakeAmount, setStakeAmount] = useState('');

  const handleStake = async () => {
    if (contract && stakeAmount) {
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
      await contract.stake({ value: stakeAmountWei });
      updateTotalStaked();
      updateWalletBalance();
    }
  };

  const handleMaxStake = () => {
    const gasReserve = ethers.utils.parseEther("0.001");
    const availableBalance = ethers.utils.parseEther(walletBalance).sub(gasReserve);
    setStakeAmount(ethers.utils.formatEther(availableBalance));
  };

  return (
    <div className="stake-section">
      <h3>Stake ETH</h3>
      <p>Your Balance: {walletBalance} ETH</p>
      <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="Enter amount" />
      <button onClick={handleMaxStake}>Max</button>
      <button onClick={handleStake}>Stake</button>
    </div>
  );
};

export default StakeSection;
