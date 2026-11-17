const express = require("express");
const { ethers } = require("ethers");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Inicializa o Gemini (Certifique-se de adicionar GEMINI_API_KEY nas variáveis de ambiente do Render)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BASE_RPC = "https://mainnet.base.org";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const USDC_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

app.get("/", (req, res) => {
  res.send("Agente Base USDC a funcionar!");
});

// Nova rota para testar o Gemini
app.get("/ia", async (req, res) => {
  try {
    const prompt = req.query.prompt || "Olá! Responda em uma linha.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ resposta: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar o Gemini", detalhes: error.message });
  }
});

app.get("/wallet-status", async (req, res) => {
  try {
    if (!process.env.PRIVATE_KEY) {
      return res.status(500).json({ erro: "Chave privada não configurada nas variáveis de ambiente do Render." });
    }

    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const ethBalanceWei = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(ethBalanceWei);

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
