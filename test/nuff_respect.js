const NuffRespect = artifacts.require("NuffRespect");
const Staking = artifacts.require("Staking");
const StakingExposedTest = artifacts.require("StakingExposedTest");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("NuffRespect", function (accounts) {
  it("should assert true", async function () {
    await NuffRespect.deployed();
    return assert.isTrue(true);
  });

  it("should start with 2 million", async () => {
    const instance = await NuffRespect.deployed();
    const expected = 2_00_000_000;
    const balance = await instance.balanceOf(accounts[0]);
    const weiBalance = web3.utils.fromWei(balance, 'ether');
    assert(expected, weiBalance);
  });
});

contract("Staking", function (accounts) {
  it("approve should set allowance", async() => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();

    const amount = 10;
    const account_one = accounts[0];
    const account_two = staking.address;
    await nuff.approve(account_two, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, account_two);
    assert.equal(amount, allowance, "not enough allowance");
  });

  it("calculate reward should return 10 when amount 100 and plan 10", async() => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 100;
    const plan = 10;
    const expected = 10;
    const actual = await stakingExp._calculateReward(plan, amount);
    assert.equal(expected, actual);
  });

  it("calculate reward should return rounded result when its not an integer", async() => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 111;
    const plan = 75;
    const expected = 83;
    const actual = await stakingExp._calculateReward(plan, amount);
    assert.equal(expected, actual);
  })

  it("calculate plan should return 5 when time is within 15 seconds", async() => {
    const stakingExp = await StakingExposedTest.deployed();
    const time = Math.floor(new Date().getTime() / 1000) - 15;
    const expected = 5;
    const actual = await stakingExp._calculatePlan(time);
    assert.equal(expected, actual);
  })

  it("calculate cover should return 75% of the amount", async() => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 100;
    const expected = 75;
    const actual = await stakingExp._calculateCover(amount);
    assert.equal(expected, actual);
  })

  it("should calculate cover when number is not easily divisible", async() => {
    const stakingExp = await StakingExposedTest.deployed();
    const amount = 111;
    const expected = 83;
    const actual = await stakingExp._calculateCover(amount);
    assert.equal(expected, actual);
  })

  it("should stake 100", async () => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = BigInt(100);
    const account_one = accounts[0];
    const account_two = staking.address;

    await nuff.approve(staking.address, 500, { from: account_one });
    await staking.topUp(500, { from: account_one });

    let balance = await nuff.balanceOf(account_one);
    balance = BigInt(balance);
    const account_one_starting_balance = BigInt(balance);

    balance = await nuff.balanceOf(account_two);
    const account_two_starting_balance = BigInt(balance);
    await nuff.approve(account_two, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, account_two);

    await staking.stake(amount, {
      from: account_one,
    });

    balance = await nuff.balanceOf(account_one);
    const account_one_ending_balance = BigInt(balance);

    balance = await nuff.balanceOf(account_two);
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

  it("should stake 100 and unstake 175", async() => {
    const staking = await Staking.deployed();
    const nuff = await NuffRespect.deployed();
    const amount = BigInt(100);
    const account_one = accounts[0];
    const account_two = staking.address;

    await nuff.approve(staking.address, 75, { from: account_one });
    await staking.topUp(75, { from: account_one });

    let balance = await nuff.balanceOf(account_one);
    balance = BigInt(balance);
    const account_one_starting_balance = BigInt(balance);

    balance = await nuff.balanceOf(account_two);
    const account_two_starting_balance = BigInt(balance);
    await nuff.approve(account_two, amount, { from: account_one });
    let allowance = await nuff.allowance(account_one, account_two);

    await staking.stake(amount, {
      from: account_one,
    });

    //time forward

  })
});
