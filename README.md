# Chat Trollgianismo — Instruções Completas

## Arquivos entregues

```
chat-trollgianismo/
├── server.js       → Servidor Node.js + Socket.io
├── package.json    → Dependências
├── index.html      → Seu HTML original + chat integrado
└── README.md       → Este arquivo
```

---

## Rodar localmente

### 1. Pré-requisito
Node.js instalado (v16+). Baixe em https://nodejs.org

### 2. Instalar dependências
```bash
cd chat-trollgianismo
npm install
```

### 3. Iniciar o servidor
```bash
npm start
```
O servidor roda em: http://localhost:3000

### 4. Configurar a URL no HTML
Abra `index.html` e encontre esta linha:
```javascript
var CHAT_SERVER_URL = 'https://SEU-SERVICO.onrender.com';
```
Troque pelo endereço local:
```javascript
var CHAT_SERVER_URL = 'http://localhost:3000';
```

### 5. Abrir o site
Abra o arquivo `index.html` no navegador.
O chat aparece na parte inferior da página, antes do footer.

---

## Hospedar no Render.com (grátis)

### Passo a passo:

1. Crie uma conta em https://render.com

2. Crie um repositório no GitHub com os arquivos `server.js` e `package.json`

3. No Render, clique em **New → Web Service**

4. Conecte seu repositório GitHub

5. Configure:
   - **Name:** chat-trollgianismo (ou qualquer nome)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Clique em **Create Web Service**

7. Aguarde o deploy. O Render fornecerá uma URL assim:
   ```
   https://chat-trollgianismo.onrender.com
   ```

### Configurar a URL no HTML após o deploy:

Abra `index.html` e encontre:
```javascript
var CHAT_SERVER_URL = 'https://SEU-SERVICO.onrender.com';
```
Substitua pela URL real do seu serviço:
```javascript
var CHAT_SERVER_URL = 'https://chat-trollgianismo.onrender.com';
```

---

## Onde fica o chat no HTML

O bloco do chat fica dentro de `.page`, logo acima do `<footer>`:

```html
<!-- ── CHAT TROLLGIANISMO ── -->
<div class="chat-section">
  ...
</div>
<!-- ── FIM CHAT ── -->

<footer>
```

---

## Observações

- O chat guarda as últimas **50 mensagens** em memória enquanto o servidor estiver rodando.
- No plano gratuito do Render, o servidor "dorme" após 15 minutos sem requisições. A primeira conexão pode demorar ~30s para acordar.
- Não há banco de dados: ao reiniciar o servidor, o histórico de mensagens é apagado.
- Nomes e mensagens são sanitizados contra XSS no front-end.
- Limite: 30 caracteres no nome, 300 na mensagem.
