import React from 'react';

const UnstakeSection = ({ contract, updateTotalStaked, updateWalletBalance, walletAddress }) => {
  const handleUnstake = async () => {
    try {
      // Ensure walletAddress is available
      if (!walletAddress) {
        console.error('Wallet address is not available');
        return;
      }

      const stakerData = await contract.stakers(walletAddress);
      const stakedAmount = stakerData.amountStaked;

      // Check if the user has any staked amount
      if (stakedAmount.isZero()) {
        console.log('No staked ETH to unstake.');
        return;
      }

      // Unstake the entire staked amount
      await contract.unstake(stakedAmount);

      // Update UI after unstaking
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
