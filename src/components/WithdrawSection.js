import React from 'react';

const WithdrawSection = ({ contract, updateRewards, rewardAvailable }) => {
  const handleWithdraw = async () => {
    await contract.withdrawReward();
    updateRewards();
  };

  return (
    <div className="withdraw-section">
      <h3>Withdraw Rewards</h3>
      <p>Reward Available: {rewardAvailable} Tokens</p>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
};

export default WithdrawSection;
