const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Seja Bem Vindo ao DPI SYS');
});

// Vercel usa a variável de ambiente PORT, mas também fornecemos um fallback
const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// Exportamos a app para o Vercel
module.exports = app;