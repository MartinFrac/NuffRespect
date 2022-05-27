const NuffRespect = artifacts.require("NuffRespect");
const Staking = artifacts.require("Staking");

module.exports = function (deployer) {
  deployer.deploy(NuffRespect)
  .then(function() {
    return deployer.deploy(Staking, NuffRespect.address);
  });
};
