// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Staking {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  IERC20 public tokenAddress;
  address public owner;

  struct Stake {
    uint256 amount;
    uint256 timestamp;
  }

  mapping(address => Stake) public stakes;

  constructor(IERC20 _contractAddress) {
    owner = msg.sender;
    tokenAddress = _contractAddress;
  }

  function getAmount() public view returns (uint256) {
    return stakes[msg.sender].amount;
  }

  function stake(uint256 amount) public {
    require(amount <= tokenAddress.allowance(msg.sender, address(this)));
    require(amount <= tokenAddress.balanceOf(msg.sender), "Not enough STATE tokens in your wallet, please try lesser amount");
    stakes[msg.sender] = Stake(amount, block.timestamp);
    tokenAddress.safeTransferFrom(msg.sender, address(this), amount);
  }
}
