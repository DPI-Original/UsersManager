const express = require('express');
const admin = require('firebase-admin');
const app = express();
const cors = require('cors');

const serviceAccount = JSON.parse(process.env.FIRE_CONNECT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.URL
});

const db = admin.database();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Seja Bem Vindo ao DPSYS');
});

app.post('/usuario', async (req, res) => {
  try {
    const { nome, email, senha, valor, chavepix } = req.body;
    const novoUsuario = {
      nome,
      email,
      senha,
      valor,
      chavepix
    };

    const novoUsuarioRef = await db.ref('usuarios').push(novoUsuario);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      id: novoUsuarioRef.key
    });
  } catch (error) {
    res.status(500).send('Erro ao criar usuário');
  }
});

app.put('/usuario/:id/valor', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (!valor || isNaN(valor)) {
      return res.status(400).send('Valor inválido');
    }

    const usuarioRef = db.ref(`usuarios/${id}`);
    const snapshot = await usuarioRef.once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).send('Usuário não encontrado');
    }

    await usuarioRef.update({ valor });
    res.json({ message: 'Valor atualizado com sucesso' });
  } catch (error) {
    res.status(500).send('Erro ao atualizar valor');
  }
});

app.put('/usuario/:id/pix', async (req, res) => {
  try {
    const { id } = req.params;
    const { chavepix } = req.body;

    if (!chavepix) {
      return res.status(400).send('Chave PIX inválida');
    }

    const usuarioRef = db.ref(`usuarios/${id}`);
    const snapshot = await usuarioRef.once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).send('Usuário não encontrado');
    }

    await usuarioRef.update({ chavepix });
    res.json({ message: 'Chave PIX atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar chave PIX:', error);
    res.status(500).send('Erro ao atualizar chave PIX');
  }
});

app.get('/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRef = db.ref(`usuarios/${id}`);
    const snapshot = await usuarioRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).send('Usuário não encontrado');
    }

    const usuario = snapshot.val();
    const { nome, email, valor, chavepix } = usuario;

    res.json({ nome, email, valor, chavepix });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).send('Erro ao obter usuário');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).send('Email e senha são obrigatórios');
    }

    const usuariosRef = db.ref('usuarios');
    const snapshot = await usuariosRef.orderByChild('email').equalTo(email).once('value');

    if (!snapshot.exists()) {
      return res.status(404).send('Usuário não encontrado');
    }

    const usuarios = snapshot.val();
    const usuarioId = Object.keys(usuarios)[0];
    const usuario = usuarios[usuarioId];

    if (usuario.senha !== senha) {
      return res.status(401).send('Senha incorreta');
    }

    res.json({
      message: 'Login bem-sucedido',
      userId: usuarioId
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login');
  }
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port);
}

// Exportamos a app para o Vercel
module.exports = app;