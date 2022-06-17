// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Staking.sol";

contract StakingExposedTest is Staking {

  IERC20 private _tokenAddress;

  constructor(IERC20 _contractAddress) Staking(_contractAddress) {
  } 

  mapping(uint256 => uint256) private _timestampToPlan;
  function calculateReward(uint256 plan, uint256 amount) public pure returns (uint256) {
    return _calculateReward(plan, amount);
  }

  function calculatePlan(uint256 time) public view returns (uint256) {
    return _calculatePlan(time);
  }

  function calculateCover(uint256 amount) public view returns (uint256) {
    return _calculateCover(amount);
  }
}
