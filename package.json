const { ethers } = require("ethers");

function generateAgentWallet() {
  const wallet = ethers.Wallet.createRandom();
  console.log("Endereço:", wallet.address);
  console.log("Chave Privada:", wallet.privateKey);
  return wallet;
}

module.exports = { generateAgentWallet };
