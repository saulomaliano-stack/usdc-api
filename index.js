const express = require("express");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da rede Base Mainnet e contrato do USDC
const BASE_RPC = "https://mainnet.base.org";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ABI mínima necessária para ler o saldo de USDC e o nome do token
const USDC_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

app.get("/", (req, res) => {
  res.send("Agente Base USDC a funcionar!");
});

app.get("/wallet-status", async (req, res) => {
  try {
    if (!process.env.PRIVATE_KEY) {
      return res.status(500).json({ erro: "Chave privada não configurada nas variáveis de ambiente do Render." });
    }

    // Ligação ao RPC da Base
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    
    // Criar a wallet com a chave privada e ligá-la à rede
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Obter saldo nativo de ETH (necessário para pagar taxas de gás na Base)
    const ethBalanceWei = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(ethBalanceWei);

    // Obter saldo de USDC
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    const usdcBalanceRaw = await usdcContract.balanceOf(wallet.address);
    const usdcDecimals = await usdcContract.decimals();
    const usdcBalance = ethers.formatUnits(usdcBalanceRaw, usdcDecimals);

    res.json({
      status: "Online",
      network: "Base Mainnet",
      walletAddress: wallet.address,
      balances: {
        ETH: ethBalance + " ETH",
        USDC: usdcBalance + " USDC"
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar a blockchain", detalhes: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
