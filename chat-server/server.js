const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ── Configurações ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MAX_HISTORY = 100;
const MAX_MSG_LEN = 300;
const MAX_NAME_LEN = 30;

const RATE_WINDOW_MS = 10_000;
const MAX_MSGS_PER_WINDOW = 5;
const DUPLICATE_WINDOW_MS = 60_000;
const MAX_LINKS_PER_MESSAGE = 2;

// No Render, configure assim:
// BANNED_TERMS=termo1,termo2,termo3
const BANNED_TERMS = (process.env.BANNED_TERMS || '')
  .split(',')
  .map((term) => normalizar(term.trim()))
  .filter(Boolean);

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/\s+/g, ' ')
    .trim();
}

function motivoBloqueio(mensagem, socket) {
  const agora = Date.now();
  const texto = normalizar(mensagem);
  const links = (mensagem.match(/https?:\/\/|www\./gi) || []).length;

  socket.data.envios = (socket.data.envios || []).filter(
    (timestamp) => agora - timestamp < RATE_WINDOW_MS
  );

  if (socket.data.envios.length >= MAX_MSGS_PER_WINDOW) {
    return 'Você está enviando mensagens rápido demais. Aguarde alguns segundos.';
  }

  if (links > MAX_LINKS_PER_MESSAGE) {
    return 'Não envie mais de dois links por mensagem.';
  }

  if (/(.)\1{7,}/.test(texto)) {
    return 'Não envie texto com repetição excessiva de caracteres.';
  }

  if (
    socket.data.ultimaMensagem === texto &&
    agora - socket.data.ultimoEnvioEm < DUPLICATE_WINDOW_MS
  ) {
    return 'Não envie a mesma mensagem repetidamente.';
  }

  if (BANNED_TERMS.some((termo) => texto.includes(termo))) {
    return 'Essa mensagem contém conteúdo que não é permitido no chat.';
  }

  socket.data.envios.push(agora);
  socket.data.ultimaMensagem = texto;
  socket.data.ultimoEnvioEm = agora;

  return null;
}

// ── Armazenamento em memória ───────────────────────────────
const usuarios = {};
const historico = [];

// ── Arquivos estáticos ─────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Socket.IO ───────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('history', historico);

  socket.on('register', ({ nome, senha } = {}) => {
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return socket.emit('register_result', { ok: false, erro: 'Nome inválido.' });
    }

    if (!senha || typeof senha !== 'string' || senha.length < 3) {
      return socket.emit('register_result', {
        ok: false,
        erro: 'Senha deve ter ao menos 3 caracteres.'
      });
    }

    const nomeClean = nome.trim().slice(0, MAX_NAME_LEN);
    const chave = nomeClean.toLowerCase();

    if (usuarios[chave]) {
      return socket.emit('register_result', {
        ok: false,
        erro: 'Esse nome já está em uso.'
      });
    }

    usuarios[chave] = { nome: nomeClean, senha };
    socket.emit('register_result', { ok: true, nome: nomeClean });
  });

  socket.on('login', ({ nome, senha } = {}) => {
    if (!nome || !senha) {
      return socket.emit('login_result', {
        ok: false,
        erro: 'Preencha nome e senha.'
      });
    }

    const user = usuarios[nome.trim().toLowerCase()];

    if (!user) {
      return socket.emit('login_result', {
        ok: false,
        erro: 'Usuário não encontrado.'
      });
    }

    if (user.senha !== senha) {
      return socket.emit('login_result', {
        ok: false,
        erro: 'Senha incorreta.'
      });
    }

    socket.emit('login_result', { ok: true, nome: user.nome });
  });

  socket.on('chat message', ({ nome, mensagem } = {}) => {
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) return;
    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim().length === 0) return;

    const motivo = motivoBloqueio(mensagem, socket);

    if (motivo) {
      socket.emit('chat_blocked', { erro: motivo });
      return;
    }

    const msg = {
      nome: nome.trim().slice(0, MAX_NAME_LEN),
      mensagem: mensagem.trim().slice(0, MAX_MSG_LEN),
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    historico.push(msg);

    if (historico.length > MAX_HISTORY) {
      historico.shift();
    }

    io.emit('chat message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
