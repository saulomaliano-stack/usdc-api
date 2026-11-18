const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateAgentWallet } = require("./wallet");

const app = express();
app.use(express.json());

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent(prompt);

    res.json({
      reply: response.text,
      wallet: agentWallet.address
    });
  } catch (error) {
    console.error("Erro no agente:", error);
    res.status(500).json({ error: "Falha ao processar a requisição" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
