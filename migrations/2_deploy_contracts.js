const NuffRespect = artifacts.require("NuffRespect");
const Staking = artifacts.require("Staking");
const StakingExposedTest = artifacts.require("StakingExposedTest");

module.exports = function (deployer) {
  deployer.deploy(NuffRespect)
  .then(function() {
    return deployer.deploy(Staking, NuffRespect.address);
  })
  .then(function() {
    return deployer.deploy(StakingExposedTest, Staking.address);
  });
};
