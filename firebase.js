import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNWB-AJGMnDbasiPGTelLVvhI2UZikO_g",
  authDomain: "trollgianismo-320d6.firebaseapp.com",
  projectId: "trollgianismo-320d6",
  storageBucket: "trollgianismo-320d6.firebasestorage.app",
  messagingSenderId: "741364981328",
  appId: "1:741364981328:web:ebbf6d7c61df964069fb55"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// CADASTRO
window.cadastrar = (email, senha) => {
  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => alert("Conta criada!"))
    .catch(err => alert(err.message));
};

// LOGIN
window.logar = (email, senha) => {
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => alert("Logado!"))
    .catch(err => alert(err.message));
};