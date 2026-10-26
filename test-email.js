require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- TESTANDO CONFIGURAÇÃO DE E-MAIL ---');
console.log('EMAIL_USER lido:', process.env.EMAIL_USER || '❌ NÃO ENCONTRADO');
console.log('EMAIL_PASS lido:', process.env.EMAIL_PASS ? '*** (Definido)' : '❌ NÃO ENCONTRADO');
console.log('---------------------------------------');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERRO CRÍTICO: O arquivo .env não está sendo lido ou as variáveis estão vazias.');
  process.exit(1);
}

const emailUser = process.env.EMAIL_USER.trim();
const emailPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

async function testarConexao() {
  try {
    console.log('⏳ Testando autenticação SMTP com o Gmail...');
    await transporter.verify();
    console.log('✅ SUCESSO! As credenciais estão 100% corretas no .env!');

    console.log('⏳ Tentando enviar e-mail de teste para:', process.env.EMAIL_DESTINO || emailUser);
    const info = await transporter.sendMail({
      from: `"Teste Voz Segura" <${emailUser}>`,
      to: process.env.EMAIL_DESTINO || emailUser,
      subject: '🧪 Teste de Conexão Nodemailer',
      text: 'Se você recebeu esta mensagem, a autenticação e envio do Nodemailer estão funcionando perfeitamente!',
    });

    console.log('🎉 E-mail enviado com sucesso! Message ID:', info.messageId);
  } catch (error) {
    console.error('\n❌ DETALHES DO ERRO AO AUTENTICAR / ENVIAR:');
    console.error('Mensagem:', error.message);
    if (error.code) console.error('Código do Erro:', error.code);
    if (error.command) console.error('Comando que falhou:', error.command);
    if (error.response) console.error('Resposta do Servidor Google:', error.response);

    console.log('\n💡 COMO RESOLVER COM BASE NO ERRO:');
    if (error.message.includes('535') || error.message.includes('BadCredentials')) {
      console.log('👉 A senha "aeaiwzktclqjvnqn" foi revogada, digitada incorretamente ou a Verificação em Duas Etapas da conta Google foi desativada.');
      console.log('👉 Vá em https://myaccount.google.com/apppasswords e crie uma nova Senha de App de 16 caracteres.');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.log('👉 Sua conexão local ou firewall está bloqueando a porta 465.');
    }
  }
}

testarConexao();