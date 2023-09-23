const Pixelflux1 = artifacts.require("Pixelflux1");
const Pixelflux2 = artifacts.require("Pixelflux2");
const Pixelflux3 = artifacts.require("Pixelflux3");

module.exports = function(deployer) {
  deployer.deploy(Pixelflux1)
    .then(() => deployer.deploy(Pixelflux2))
    .then(() => deployer.deploy(Pixelflux3));
};
