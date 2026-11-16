const express = require('express');
const { ethers } = require('ethers');
const app = express();
const PORT = process.env.PORT || 3000;

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

app.get('/', (req, res) => {
  res.send('API de Monitoramento e Automação USDC ativa!');
});

app.get('/wallet-status', async (req, res) => {
  try {
    if (!process.env.PRIVATE_KEY) {
      return res.status(400).json({ erro: "Chave privada não configurada nas variáveis de ambiente do Render." });
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const ethBalance = await provider.getBalance(wallet.address);
    
    res.json({
      enderecoCarteira: wallet.address,
      saldoETH: ethers.formatEther(ethBalance),
      mensagem: "Carteira pronta para operar na rede Base!"
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
