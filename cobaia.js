const express = require('express');
const oracledb = require('oracledb');
const app = express();

app.use(express.json());

const config = {
  user: 'admin',                // Substitua com seu usuário do banco de dados
  password: 'Wonderware1.',              // Substitua com sua senha do banco de dados
  connectString: 'testedb.c7qus2seaozi.us-east-1.rds.amazonaws.com:1521/ORCL'  // Certifique-se de que 'ORCL' está correto
};

// Helper function to execute queries
async function executeQuery(query, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(query, binds, options);
    return result;
  } catch (err) {
    console.error('Erro ao executar a consulta:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Endpoint para obter todos os carros
app.get('/ORCL', async (req, res) => {
  try {
    console.log('Consultando todos os carros...');
    const result = await executeQuery('SELECT * FROM CarsDB');  // Atualize o nome da tabela para 'CarsDB'
    console.log('Resultado da consulta:', result.rows);
    res.status(200).json({
      status: 'success',
      data: {
        cars: result.rows
      }
    });
  } catch (err) {
    console.error('Erro ao consultar todos os carros:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao consultar o banco de dados'
    });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log('Servidor iniciado na porta', port);
});

