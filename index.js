const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// Inicializa o Gemini
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configura o provedor da rede e a carteira do agente
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const agentWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Endereço de destino fixo para onde os fundos serão direcionados
const TARGET_WALLET = "0xSeuEnderecoDeDestinoAqui";

app.get("/", (req, res) => {
  res.json({
    status: "Agente Autônomo de Transações Online",
    agentAddress: agentWallet.address,
    targetAddress: TARGET_WALLET
  });
});

app.post("/agent-loop", async (req, res) => {
  try {
    const { prompt, amount } = req.body;

    // 1. A IA analisa o contexto e decide se aprova o envio
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const instruction = `Analise a solicitação: "${prompt}". Responda APENAS com "APROVADO" se a condição for válida para liberar o pagamento, ou "NEGADO" caso contrário.`;
    
    const result = await model.generateContent(instruction);
    const decision = result.response.text().trim().toUpperCase();

    if (decision !== "APROVADO") {
      return res.json({
        status: "Transação não executada",
        decision,
        reason: "Condição não aprovada pela IA."
      });
    }

    // 2. Se aprovado, executa a transação na blockchain
    const tx = await agentWallet.sendTransaction({
      to: TARGET_WALLET,
      value: ethers.parseEther(amount || "0.001") // Valor padrão caso não seja enviado
    });

    // Aguarda a confirmação na rede
    const receipt = await tx.wait();

    // 3. Retorna o comprovante
    res.json({
      status: "Transação Concluída",
      decision,
      txHash: receipt.hash,
      from: agentWallet.address,
      to: TARGET_WALLET
    });

  } catch (error) {
    console.error("Erro no loop do agente:", error);
    res.status(500).json({ error: "Falha ao processar o ciclo", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agente rodando na porta ${PORT}`);
});
