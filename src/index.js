const express = require('express');
const app = express();

// Middleware para ler JSON nas requisições
app.use(express.json());

// Rota de Webhook
app.post('/webhook-pix', async (req, res) => {
  try {
    const dadosPagamento = req.body;

    // Verifica se o pagamento foi realmente aprovado
    if (dadosPagamento.status === 'approved' || dadosPagamento.status === 'PAID') {
      const valor = dadosPagamento.amount;
      console.log(`Pix recebido de R$ ${valor}! Iniciando repasse...`);

      // Chama a função do controller para transferir o dinheiro
      await realizarTransferencia(valor);
    }

    // Responde ao banco/gateway que o webhook foi recebido com sucesso
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
