// IMPORTS (funcionam direto no navegador)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// CONFIG DO SEU PROJETO
const firebaseConfig = {
  apiKey: "AIzaSyCNWB-AJGMnDbasiPGTelLVvhI2UZikO_g",
  authDomain: "trollgianismo-320d6.firebaseapp.com",
  projectId: "trollgianismo-320d6",
  storageBucket: "trollgianismo-320d6.firebasestorage.app",
  messagingSenderId: "741364981328",
  appId: "1:741364981328:web:ebbf6d7c61df964069fb55"
};

// INICIALIZA
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================
// 🔥 CADASTRO
// ==========================
window.cadastrar = (email, senha) => {
  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Conta criada com sucesso!");
    })
    .catch(err => {
      alert("Erro: " + err.message);
    });
};

// ==========================
// 🔥 LOGIN
// ==========================
window.logar = (email, senha) => {
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Logado com sucesso!");

      // ESCONDE LOGIN
      const overlay = document.getElementById('loginOverlay');
      if (overlay) overlay.style.display = 'none';
    })
    .catch(err => {
      alert("Erro: " + err.message);
    });
};

// ==========================
// 🧠 MANTER USUÁRIO LOGADO
// ==========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário já logado:", user.email);

    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.display = 'none';
  } else {
    console.log("Nenhum usuário logado");
  }
});