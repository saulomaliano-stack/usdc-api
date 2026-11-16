const express = require("express");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3000;

// Se não houver chave privada configurada, gera uma carteira nova automaticamente
const wallet = process.env.PRIVATE_KEY 
    ? new ethers.Wallet(process.env.PRIVATE_KEY) 
    : ethers.Wallet.createRandom();

app.get("/", (req, res) => {
  res.send("Agente Base USDC a funcionar!");
});

app.get("/wallet-status", async (req, res) => {
  try {
    res.json({
      status: "Online",
      network: "Base Mainnet",
      walletAddress: wallet.address,
      privateKeyGerada: process.env.PRIVATE_KEY ? "Usando a chave configurada" : wallet.privateKey,
      aviso: "Guarde a chave privada acima num local seguro se esta for uma carteira nova!"
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
