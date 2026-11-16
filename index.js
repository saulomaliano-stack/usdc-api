const express = require('express');
const { ethers } = require('ethers');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API de Monitoramento USDC na Base ativa!');
});

app.get('/monitor', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      status: 'Conectado à Base com sucesso!',
      blocoAtual: blockNumber,
      tokenUSDC: USDC_ADDRESS,
      mensagem: 'Pronto para monitorar transações!'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
