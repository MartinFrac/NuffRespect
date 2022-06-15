const NuffRespect = artifacts.require("NuffRespect");
const Staking = artifacts.require("Staking");
const StakingExposedTest = artifacts.require("StakingExposedTest");
const truffleAssert = require("truffle-assertions");

contract("NuffRespect", function (accounts) {
  const account_one = accounts[0];
  const account_two = accounts[1];

  it("should assert true", async function () {
    await NuffRespect.deployed();
    return assert.isTrue(true);
  });

  it("should start with 2 million", async () => {
    const instance = await NuffRespect.deployed();
    const expected = 2_00_000_000;
    const balance = await instance.balanceOf(account_one);
    const weiBalance = web3.utils.fromWei(balance, "ether");
    assert(expected, weiBalance);
  });
});

contract("getAmount", function (accounts) {
  const account_one = accounts[0];

  it("get amount should return amount", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const topUp = 100;

    const expected1 = 0;
    const expected2 = 100;

    const amount1 = await staking.balanceOf(account_one);
    await nuff.approve(staking.address, topUp+expected2);
    await staking.topUp(topUp);
    await staking.stake(expected2);
    const amount2 = await staking.balanceOf(account_one);

    assert.equal(expected1, amount1);
    assert.equal(expected2, amount2);
  });
})

contract("StakingViews", function (accounts) {
  const account_one = accounts[0];
  const account_two = accounts[1];

  it("get coverage should return coverage", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const expected1 = 0;
    const expected2 = 75;
    const amount = 100;

    const coverage1 = await staking.getCoverage.call();
    await nuff.approve(staking.address, amount+expected2);
    await staking.topUp(expected2);
    await staking.stake(amount);
    const coverage2 = await staking.getCoverage.call();

    assert.equal(expected1, coverage1);
    assert.equal(expected2, coverage2);
  });

})

contract("Staking", function (accounts) {
  const account_one = accounts[0];
  const account_two = accounts[1];

  it("get resources should return resources", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const expected1 = 0;
    const expected2 = 20;
    
    const resources1 = await staking.getResources.call();
    await nuff.approve(staking.address, 20);
    await staking.topUp(20);
    const resources2 = await staking.getResources.call();

    assert.equal(expected1, resources1);
    assert.equal(expected2, resources2);
  });

  it("stake should throw an exception when resources are not sufficient", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = 100;

    await nuff.approve(staking.address, amount);

    await truffleAssert.reverts(staking.stake(amount), "Staking is inactive");
  });

  it("approve should set allowance", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();

    const amount = 100;
    await nuff.approve(staking.address, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, staking.address);
    assert.equal(amount, allowance, "not enough allowance");
  });

  it("stake should revert without allowance", async () => {
    const staking = await Staking.deployed();
    await truffleAssert.reverts(staking.stake(100));
  });

  it("calculate reward should return 10%", async () => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 100;
    const plan = 10;
    const expected = 10;
    const actual = await stakingExp._calculateReward(plan, amount);
    assert.equal(expected, actual);
  });

  it("calculate reward should return rounded result when its not an integer", async () => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 111;
    const plan = 75;
    const expected = 83;
    const actual = await stakingExp._calculateReward(plan, amount);
    assert.equal(expected, actual);
  });

  it("calculate plan should return 5 when time is within 75 seconds", async () => {
    const stakingExp = await StakingExposedTest.deployed();
    const time = Math.floor(new Date().getTime() / 1000) - 75;
    const expected = 5;
    const actual = await stakingExp._calculatePlan(time);
    assert.equal(expected, actual);
  });

  it("calculate cover should return 75% of the amount", async () => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 100;
    const expected = 75;
    const actual = await stakingExp._calculateCover(amount);
    assert.equal(expected, actual);
  });

  it("should calculate cover when number is not easily divisible", async () => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 111;
    const expected = 83;
    const actual = await stakingExp._calculateCover(amount);
    assert.equal(expected, actual);
  });

  it("unstake should throw an exception when nothing to unstake", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const topUp = 500;

    await nuff.approve(staking.address, topUp);
    await staking.topUp(topUp);

    await truffleAssert.reverts(staking.unstake(), "Nothing to unstake");
  });

  it("should stake 100", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = BigInt(100);

    await nuff.approve(staking.address, 500, { from: account_one });
    await staking.topUp(500, { from: account_one });

    let balance = await nuff.balanceOf(account_one);
    balance = BigInt(balance);
    const account_one_starting_balance = BigInt(balance);

    balance = await nuff.balanceOf(staking.address);
    const account_two_starting_balance = BigInt(balance);
    await nuff.approve(staking.address, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, staking.address);

    await staking.stake(amount, {
      from: account_one,
    });

    balance = await nuff.balanceOf(account_one);
    const account_one_ending_balance = BigInt(balance);

    balance = await nuff.balanceOf(staking.address);
    const account_two_ending_balance = BigInt(balance);

    assert.equal(amount, allowance, "not enough allowance");

    assert.equal(
      account_one_ending_balance,
      account_one_starting_balance - amount,
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      account_two_ending_balance,
      account_two_starting_balance + amount,
      "Amount wasn't correctly sent to the receiver"
    );
  });

  it("stake should throw an exception when below 100", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = 10;
    const topUp = 500;

    await nuff.approve(staking.address, amount + topUp);
    await staking.topUp(topUp, { from: account_one });

    await truffleAssert.reverts(
      staking.stake(amount),
      "Minimum staking amount not satisfied"
    );
  });

  it("stake should throw an exception when not enough balance", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = 100;
    const topUp = 500;
    const expected = 0;

    await nuff.approve(staking.address, topUp);
    await staking.topUp(topUp);
    await nuff.approve(staking.address, amount, { from: account_two });

    await truffleAssert.fails(
      staking.stake(amount, { from: account_two }),
      truffleAssert.ErrorType.OUT_OF_GAS,
      null,
      "This method should run out of gas"
    );

    const staked = await staking.balanceOf(account_two);
    assert.equal(expected, staked);
  });

  it("stake should throw an exception when inactive", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = 100;
    const topUp = 500;

    await nuff.approve(staking.address, topUp);
    await staking.topUp(topUp);
    await staking.setStatus(false);
    await nuff.approve(staking.address, amount);

    await truffleAssert.reverts(staking.stake(amount), "Staking is inactive");
    await staking.setStatus(true);
  });




  it("should stake 100 and unstake 175", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = BigInt(100);

    await nuff.approve(staking.address, 75, { from: account_one });
    await staking.topUp(75, { from: account_one });

    let balance = await nuff.balanceOf(account_one);
    balance = BigInt(balance);
    const account_one_starting_balance = BigInt(balance);

    balance = await nuff.balanceOf(staking.address);
    const account_two_starting_balance = BigInt(balance);
    await nuff.approve(staking.address, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, staking.address);

    await staking.stake(amount, {
      from: account_one,
    });

    //time forward
  });
});
