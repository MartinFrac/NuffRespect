const NuffRespect = artifacts.require("NuffRespect");

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
  })
});
