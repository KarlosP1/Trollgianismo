const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Histórico de mensagens em memória (últimas 50)
const MAX_HISTORY = 50;
let messageHistory = [];

io.on('connection', (socket) => {
  console.log(`[+] Usuário conectado: ${socket.id}`);

  // Envia o histórico para o novo usuário
  socket.emit('history', messageHistory);

  socket.on('chat message', (data) => {
    const nome = (data.nome || '').trim().slice(0, 30);
    const mensagem = (data.mensagem || '').trim().slice(0, 300);

    if (!nome || !mensagem) return;

    const msg = {
      nome,
      mensagem,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    messageHistory.push(msg);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift();

    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Usuário desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Trollgianismo rodando na porta ${PORT}`);
});
