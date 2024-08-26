const express = require('express');
const mysql = require('mysql2/promise'); // Utilizando mysql2 com suporte a Promises
const app = express();

app.use(express.json());

// Configuração da conexão com o MySQL
const config = {
  host: 'mysqldb.c7qus2seaozi.us-east-1.rds.amazonaws.com',   // Substitua pela localização do seu servidor MySQL
  user: 'admin',                // Substitua pelo usuário do MySQL
  password: 'Wonderware1.',              // Substitua pela senha do MySQL
  database: 'CarsDB'         // Substitua pelo nome do banco de dados
};

// Função auxiliar para executar consultas
async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    const [results, ] = await connection.execute(query, params);
    return results;
  } catch (err) {
    console.error('Erro ao executar a consulta:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Endpoint para obter todos os carros
app.get('/Cars', async (req, res) => { // Você pode querer renomear este endpoint
  try {
    console.log('Consultando todos os carros...');
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable');  // Atualize o nome da tabela se necessário
    console.log('Resultado da consulta:', result);
    res.status(200).json({
      status: 'success',
      data: {
        cars: result
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
app.listen(port, '0.0.0.0', () => {
  console.log('Servidor iniciado na porta', port);
});




