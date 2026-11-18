const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const agentWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const TARGET_WALLET = "0x8744B447Ba73b988a4596588764b7876387589F2";

setInterval(async () => {
  try {
    const balanceWei = await provider.getBalance(agentWallet.address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));
    console.log(`Saldo atual: ${balanceEth} ETH`);

    if (balanceEth > 0.01) {
      console.log("Saldo excedido. Iniciando transferência...");
      const gasEstimate = 21000n;
      const feeData = await provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("0.05", "gwei");
      const totalGasCost = gasEstimate * maxFeePerGas;

      const amountToSend = balanceWei - totalGasCost;

      if (amountToSend > 0n) {
        const tx = await agentWallet.sendTransaction({
          to: TARGET_WALLET,
          value: amountToSend
        });
        console.log("Transação enviada! Hash:", tx.hash);
        await tx.wait();
        console.log("Transferência confirmada.");
      }
    }
  } catch (error) {
    console.error("Erro ao processar o ciclo:", error.message);
  }
}, 60000);

app.get("/", (req, res) => {
  res.send("Agente autônomo online!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
