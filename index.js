const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

const ai = new GoogleGenAI();

// Configurações da Blockchain (Base Network)
const RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(RPC_URL);
// Usa a chave privada configurada no Render
const agentWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Endereço que vai receber os fundos
const TARGET_WALLET = "0x8744B447Ba73b988a4596588764b7876387589F2";

// Loop automático: checa o saldo a cada 60 segundos
setInterval(async () => {
  try {
    const balanceWei = await provider.getBalance(agentWallet.address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));
    
    console.log(`Saldo atual: ${balanceEth} ETH`);

    // Define o limite mínimo para disparar a transferência (ex: acima de 0.01 ETH)
    if (balanceEth > 0.01) {
      console.head("Saldo excedido. Iniciando transferência...");
      
      // Calcula o valor a enviar (deixando uma pequena margem para a taxa de gás)
      const gasEstimate = 21000n; // Limite padrão para transferência simples de ETH
      const feeData = await provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("0.05", "gwei");
      const totalGasCost = gasEstimate * maxFeePerGas;

      const amountToSend = balanceWei - totalGasCost;

      if (amountToSend > 0n) {
        const tx = await agentWallet.sendTransaction({
          to: TARGET_WALLET,
          value: amountToSend
        });
        console.log("Transação enviada com sucesso! Hash:", tx.hash);
        await tx.wait();
        console.log("Transferência confirmada na rede.");
      }
    }
  } catch (error) {
    console.error("Erro ao processar o ciclo de transferência:", error.message);
  }
}, 60000); // 60000 ms = 1 minuto

app.get("/", (req, res) => {
  res.send("Agente autônomo com transferência automática online!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
