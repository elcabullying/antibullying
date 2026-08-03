// Importação dos módulos necessários
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

// Servir arquivos estáticos (HTML, CSS, imagens) da mesma pasta
app.use(express.static(path.join(__dirname)));

// Configuração do Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Ignora avisos de certificado SSL local
  }
});

// Teste de conexão do e-mail ao iniciar (Apenas em ambiente local)
if (!process.env.VERCEL) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Erro na configuração do e-mail:', error);
    } else {
      console.log('✅ Servidor de e-mail pronto para enviar mensagens!');
    }
  });
}

// Rota POST para receber o relato do formulário HTML
app.post('/api/relato', async (req, res) => {
  const { 
    nome, 
    turma, 
    vitima_testemunha, 
    tipo_bullying, 
    local, 
    descricao, 
    frequencia 
  } = req.body;

  // Validação básica de campos obrigatórios do HTML
  if (!descricao || !tipo_bullying || !local || !vitima_testemunha) {
    return res.status(400).json({ 
      success: false, 
      mensagem: 'Por favor, preencha todos os campos obrigatórios.' 
    });
  }

  // Template do E-mail formatado
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
            <td style="padding: 10px;">${frequencia}</td>
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
    console.log(`📬 Relato enviado com sucesso!`);
    return res.status(200).json({ 
      success: true, 
      mensagem: 'Relato enviado com sucesso.' 
    });
  } catch (error) {
    console.error('❌ Erro ao enviar o e-mail:', error);
    return res.status(500).json({ 
      success: false, 
      mensagem: 'Erro interno ao tentar enviar o relato por e-mail.',
      detalhes: error.message 
    });
  }
});

// Inicialização local do Servidor
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`Acesse a aplicação em: http://localhost:${PORT}/relato.html`);
  });
}

// Exportação obrigatória para a Vercel funcionar
module.exports = app;