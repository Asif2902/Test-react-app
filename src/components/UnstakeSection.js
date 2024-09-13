import React from 'react';

const UnstakeSection = ({ contract, updateTotalStaked, updateWalletBalance }) => {
  const handleUnstake = async () => {
    const stakerData = await contract.stakers(walletAddress);
    const stakedAmount = stakerData.amountStaked;
    await contract.unstake(stakedAmount);
    updateTotalStaked();
    updateWalletBalance();
  };

  return (
    <div className="unstake-section">
      <h3>Unstake ETH</h3>
      <button onClick={handleUnstake}>Unstake All</button>
    </div>
  );
};

export default UnstakeSection;
