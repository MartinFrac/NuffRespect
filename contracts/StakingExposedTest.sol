// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Staking.sol";

contract StakingExposedTest is Staking {

  IERC20 private _tokenAddress;

  constructor(IERC20 _contractAddress) Staking(_contractAddress) {
  } 

  mapping(uint256 => uint256) private _timestampToPlan;
  function _calculateReward(uint256 plan, uint256 amount) public pure returns (uint256) {
    return calculateReward(plan, amount);
  }

  function _calculatePlan(uint256 time) public view returns (uint256) {
    return calculatePlan(time);
  }

  function _calculateCover(uint256 amount) public view returns (uint256) {
    return calculateCover(amount);
  }
}
