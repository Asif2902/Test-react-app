import React from 'react';


const UnstakeSection = ({ contract, walletAddress, updateTotalStaked, updateWalletBalance }) => {

  const handleUnstake = async () => {
    if (!walletAddress || !contract) {
      alert('Wallet or contract not connected.');
      return;
    }

    try {
      // Fetch the staker's data using the wallet address
      const stakerData = await contract.stakers(walletAddress);

      // Ensure stakedAmount is a valid BigNumber
      const stakedAmount = stakerData.amountStaked;
      
      if (stakedAmount.eq(0)) {
        alert('No staked amount to unstake.');
        return;
      }

      // Unstake the staked amount
      const tx = await contract.unstake(stakedAmount);

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Update the UI after successful transaction
      updateTotalStaked();
      updateWalletBalance();

    } catch (error) {
      console.error('Unstaking failed:', error);
      alert('Failed to unstake. Please try again.');
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
