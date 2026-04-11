// ═══════════════════════════════════════════════════════════
//  server.js — Trollgianismo Chat + Sistema de Login Próprio
// ═══════════════════════════════════════════════════════════

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ── Configurações ──────────────────────────────────────────
const PORT          = process.env.PORT || 3000;
const MAX_HISTORY   = 100;   // mensagens mantidas em memória
const MAX_MSG_LEN   = 300;
const MAX_NAME_LEN  = 30;

// ── Armazenamento em memória ───────────────────────────────
//  usuarios: { [nome_lowercase]: { nome: string, senha: string } }
const usuarios = {};

//  historico: array de { nome, mensagem, timestamp }
const historico = [];

// ── Servir arquivos estáticos (index.html na mesma pasta) ──
app.use(express.static(path.join(__dirname)));

// ── Socket.io ──────────────────────────────────────────────
io.on('connection', (socket) => {

  // Envia histórico para o novo cliente
  socket.emit('history', historico);

  // ── CADASTRO ────────────────────────────────────────────
  socket.on('register', ({ nome, senha }) => {
    // Validações básicas
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return socket.emit('register_result', { ok: false, erro: 'Nome inválido.' });
    }
    if (!senha || typeof senha !== 'string' || senha.length < 3) {
      return socket.emit('register_result', { ok: false, erro: 'Senha deve ter ao menos 3 caracteres.' });
    }

    const nomeClean = nome.trim().slice(0, MAX_NAME_LEN);
    const chave     = nomeClean.toLowerCase();

    if (usuarios[chave]) {
      return socket.emit('register_result', { ok: false, erro: 'Esse nome já está em uso.' });
    }

    usuarios[chave] = { nome: nomeClean, senha: senha };
    console.log(`[register] novo usuário: ${nomeClean}`);

    socket.emit('register_result', { ok: true, nome: nomeClean });
  });

  // ── LOGIN ────────────────────────────────────────────────
  socket.on('login', ({ nome, senha }) => {
    if (!nome || !senha) {
      return socket.emit('login_result', { ok: false, erro: 'Preencha nome e senha.' });
    }

    const chave = nome.trim().toLowerCase();
    const user  = usuarios[chave];

    if (!user) {
      return socket.emit('login_result', { ok: false, erro: 'Usuário não encontrado.' });
    }
    if (user.senha !== senha) {
      return socket.emit('login_result', { ok: false, erro: 'Senha incorreta.' });
    }

    console.log(`[login] ${user.nome}`);
    socket.emit('login_result', { ok: true, nome: user.nome });
  });

  // ── MENSAGEM DE CHAT ─────────────────────────────────────
  socket.on('chat message', ({ nome, mensagem }) => {
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) return;
    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim().length === 0) return;

    const msg = {
      nome:      nome.trim().slice(0, MAX_NAME_LEN),
      mensagem:  mensagem.trim().slice(0, MAX_MSG_LEN),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    historico.push(msg);
    if (historico.length > MAX_HISTORY) historico.shift();

    io.emit('chat message', msg);
  });

});

// ── Start ──────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
