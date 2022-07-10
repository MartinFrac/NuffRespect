// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  IERC20 private _tokenAddress;
  bool private _isActive;
  uint256 private _minStakingAmount;
  //reward pool
  uint256 private _resources;
  //locked rewards for current stakers
  uint256 private _coverage;
  uint256 private _totalStaked;
  uint256 private _totalSupply;
  uint256 private _firstPlan;
  uint256 private _secondPlan;
  uint256 private _thirdPlan;

  mapping(address => Stake) private _stakes;
  mapping(uint256 => uint256) private _timestampToPlan;

  struct Stake {
    uint256 amount;
    uint256 timestamp;
  }

  modifier checkActive() {
    require(_isActive == true, "Staking is inactive");
    _;
  }

  modifier checkCoverage(uint256 amount) {
    require(_resources >= _coverage.add(_calculateCover(amount)), "amount exceeds resources");
    _;
  }

    constructor(IERC20 _contractAddress) {
    _tokenAddress = _contractAddress;
    _firstPlan = 1 minutes;
    _secondPlan = 2 minutes;
    _thirdPlan = 3 minutes;
    _timestampToPlan[_firstPlan] = 5;
    _timestampToPlan[_secondPlan] = 20;
    _timestampToPlan[_thirdPlan] = 75;
    _minStakingAmount = 100;
    _isActive = true;
  }
  
  // ---> Views external
  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function status() external view returns (bool) {
    return _isActive;
  }

  function resources() external view returns (uint256) {
    return _resources;
  }

  function coverage() external onlyOwner view returns (uint256) {
    return _coverage;
  }

  function totalStaked() external onlyOwner view returns (uint256) {
    return _totalStaked;
  }

  function balanceOf(address account) external view returns (uint256) {
    return _stakes[account].amount;
  }

  function planOf(address account) external view returns (uint256) {
    return _calculatePlan(_stakes[account].timestamp);
  }

  // ---> Views internal
  function _calculateReward(uint256 plan, uint256 amount) internal pure returns (uint256) {
    if (plan == 0) return 0;
    return amount.mul(plan).div(100);
  }

  function _calculatePlan(uint256 time) internal view returns (uint256) {
    uint256 passed = block.timestamp.sub(time);
    if (passed >= _thirdPlan) return _timestampToPlan[_thirdPlan];
    if (passed >= _secondPlan) return _timestampToPlan[_secondPlan];
    if (passed >= _firstPlan) return _timestampToPlan[_firstPlan];
    return 0;
  }

  function _calculateCover(uint256 amount) internal view returns (uint256) {
    return amount.mul(_timestampToPlan[_thirdPlan]).div(100);
  }

  // ---> Mutative functions
  function setStatus(bool newStatus) public onlyOwner {
    _isActive = newStatus;
  }

  function topUp(uint256 amount) public onlyOwner {
    _tokenAddress.transferFrom(msg.sender, address(this), amount);
    _resources = _resources.add(amount);
    _totalSupply = _totalSupply.add(amount);
    emit ToppedUp(amount);
  }

  function getNotCoveredResources() public onlyOwner {
    uint256 amount = _resources.sub(_coverage);
    _resources = _coverage;
    _totalSupply = _totalSupply.sub(amount);
    _tokenAddress.safeTransfer(msg.sender, amount);
  }

  function stake(uint256 amount) public checkActive checkCoverage(amount) {
    require(amount >= _minStakingAmount, "Minimum staking amount not satisfied");
    _stakes[msg.sender] = Stake(amount.add(_stakes[msg.sender].amount), block.timestamp);
    _coverage = _coverage.add(_calculateCover(amount));
    _totalStaked = _totalStaked.add(amount);
    _totalSupply = _totalSupply.add(amount);
    _tokenAddress.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function unstake() public {
    uint256 staked = _stakes[msg.sender].amount;
    require(staked > 0, "Nothing to unstake");
    uint256 cover = _calculateCover(staked);
    uint256 plan = _calculatePlan(_stakes[msg.sender].timestamp);
    uint256 reward = _calculateReward(plan, staked);
    uint256 total = staked.add(reward);
    _coverage = _coverage.sub(cover);
    _resources = _resources.sub(reward);
    _totalSupply = _totalSupply.sub(total);
    _totalStaked = _totalStaked.sub(staked);
    _stakes[msg.sender].amount = 0;
    _tokenAddress.transfer(msg.sender, total);
    emit Unstaked(msg.sender, total);
  }

  event Staked(address user, uint256 amount);
  event Unstaked(address user, uint256 reward);
  event ToppedUp(uint256 amount);
}
