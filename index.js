const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { generateAgentWallet } = require("./wallet");

const app = express();
app.use(express.json());

const ai = new GoogleGenAI();
const agentWallet = generateAgentWallet();

app.get("/", (req, res) => {
  res.json({
    status: "Agente Autônomo Online",
    walletAddress: agentWallet.address
  });
});

app.post("/agent", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Você é um agente financeiro autônomo. O endereço da sua carteira cripto é ${agentWallet.address}. Responda ao comando do usuário de forma direta: ${prompt}`
    });

    res.json({
      reply: response.text,
      wallet: agentWallet.address
    });
  } catch (error) {
    console.error("Erro no agente:", error);
    res.status(500).json({ error: "Falha ao processar comando do agente." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
