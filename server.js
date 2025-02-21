const express = require('express');
const app = express();
const path = require('path');
const port = 3000;


app.use(express.static(path.join(__dirname)));


app.get('/process', (req, res) => {
  let result = 'Resultado do processamento no servidor';
  res.json({ result });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
