const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Configura cabeçalhos de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, mensagem: 'Método não permitido.' });
  }

  try {
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

    const emailUser = 'vascbianca485@gmail.com';
    const emailPass = 'hfgvcuxrrzjcsmet';
    const emailDestino = 'elcabullying@gmail.com';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Voz Segura" <${emailUser}>`,
      to: emailDestino,
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

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, mensagem: 'Relato enviado com sucesso.' });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      mensagem: 'Erro ao enviar e-mail.', 
      detalhes: error.message || 'Erro interno no servidor' 
    });
  }
};
