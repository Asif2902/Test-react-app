import React from 'react';

const UnstakeSection = ({ contract, updateTotalStaked, updateWalletBalance, walletAddress }) => {
  const handleUnstake = async () => {
    try {
      const stakerData = await contract.stakers(walletAddress);  // Use walletAddress from props
      const stakedAmount = stakerData.amountStaked;
      await contract.unstake(stakedAmount);
      updateTotalStaked();
      updateWalletBalance();
    } catch (error) {
      console.error('Error unstaking:', error);
    }
  };

  return (
    <div className="unstake-section">
      <h3>Unstake ETH</h3>
      <button onClick={handleUnstake}>Unstake All</button>
    </div>
  );
};

export default UnstakeSection;
