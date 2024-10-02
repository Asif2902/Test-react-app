import React from 'react';

const WithdrawSection = ({ contract, updateRewards, rewardAvailable }) => {
  const handleWithdraw = async () => {
    await contract.withdrawReward();
    updateRewards();
  };

  return (
    <div className="withdraw-section">
      <h3>Withdraw Rewards</h3>
      <code>Reward Available: {rewardAvailable} Tokens</code>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
};

export default WithdrawSection;
