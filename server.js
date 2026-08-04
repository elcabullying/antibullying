const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos padrão (CSS, JS, mídias)
app.use(express.static(__dirname));

// Rota principal (raiz do site)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota dinâmica para entregar QUALQUER imagem .png
app.get('/:imagem.png', (req, res) => {
  const imagem = req.params.imagem;
  res.sendFile(path.join(__dirname, `${imagem}.png`), (err) => {
    if (err) {
      res.status(404).send('Imagem não encontrada');
    }
  });
});

// Rota dinâmica para abrir qualquer página .html (suporta nomes com acento)
app.get('/:pagina.html', (req, res) => {
  const pagina = decodeURIComponent(req.params.pagina);
  res.sendFile(path.join(__dirname, `${pagina}.html`), (err) => {
    if (err) {
      res.status(404).send('Página não encontrada');
    }
  });
});

// Rota POST para receber o relato do formulário
app.post('/api/relato', async (req, res) => {
  const { 
    nome, 
    turma, 
    vitima_testemunha, 
    tipo_bullying, 
    local, 
    descricao, 
    frequencia 
  } = req.body || {};

  if (!descricao || !tipo_bullying || !local || !vitima_testemunha) {
    return res.status(400).json({ 
      success: false, 
      mensagem: 'Por favor, preencha todos os campos obrigatórios.' 
    });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Voz Segura" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_DESTINO || process.env.EMAIL_USER,
    subject: `[Voz Segura] Novo Relato: ${tipo_bullying}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1A1C24; max-width: 600px; margin: 0 auto; border: 1px solid #E2D9F3; border-radius: 12px; padding: 24px; background-color: #ffffff;">
        <h2 style="color: #8367C7; border-bottom: 2px solid #8367C7; padding-bottom: 8px; margin-top: 0;">🛡️ Novo Relato Cadastrado</h2>
        <p style="font-size: 0.85rem; color: #706F78;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.95rem;">
          <tr style="background-color: #F4F0FA;">
            <td style="padding: 10px; width: 40%;"><strong>Nome:</strong></td>
            <td style="padding: 10px;">${nome ? nome : '<em>Anônimo</em>'}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Turma/Série:</strong></td>
            <td style="padding: 10px;">${turma ? turma : '<em>Não informada</em>'}</td>
          </tr>
          <tr style="background-color: #F4F0FA;">
            <td style="padding: 10px;"><strong>Envolvimento:</strong></td>
            <td style="padding: 10px;">${vitima_testemunha}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Tipo de Ocorrência:</strong></td>
            <td style="padding: 10px;">${tipo_bullying}</td>
          </tr>
          <tr style="background-color: #F4F0FA;">
            <td style="padding: 10px;"><strong>Local:</strong></td>
            <td style="padding: 10px;">${local}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Frequência:</strong></td>
            <td style="padding: 10px;">${frequencia ? frequencia : '<em>Não informada</em>'}</td>
          </tr>
        </table>
        <h3 style="margin-top: 24px; color: #1A1C24; font-size: 1rem;">Descrição Detalhada:</h3>
        <div style="background-color: #EBF3F7; padding: 16px; border-radius: 8px; border-left: 4px solid #8367C7; white-space: pre-wrap; line-height: 1.5; font-size: 0.95rem;">
          ${descricao}
        </div>
        <hr style="border: none; border-top: 1px solid #EAE6F0; margin-top: 25px;" />
        <p style="font-size: 0.75rem; color: #92919A; text-align: center; margin-bottom: 0;">Mensagem gerada automaticamente pelo sistema Voz Segura.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, mensagem: 'Relato enviado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, mensagem: 'Erro ao enviar e-mail.', detalhes: error.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
}

module.exports = app;
