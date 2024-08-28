//1ª API finalizada, um pouco mais confusa mas sólida e com tudo mais detalhado, incluindo a teteão de erros

const express = require('express');
const mysql = require('mysql2/promise'); // Utilizando mysql2 com suporte a Promises
const app = express();

app.use(express.json());

// Configuração da conexão com o MySQL
const config = {
  host: 'mysqldb.c7qus2seaozi.us-east-1.rds.amazonaws.com',   
  user: 'admin',                
  password: 'Wonderware1.',              
  database: 'CarsDB'         
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

// GET -> para obter todos os carros
app.get('/Cars', async (req, res) => { 
  try {
    console.log('Consultando todos os carros...');
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable');  
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

// GET id-> para obter um carro especifico pelo seu ID
app.get('/Cars/:id', async (req, res) => {
    const carId = req.params.id;
    try {
      console.log(`Consultando o carro com ID ${carId}...`);
      const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE id = ?', [carId]);
      
      if (result.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Carro não encontrado'
        });
      } else {
        console.log('Resultado da consulta:', result);
        res.status(200).json({
          status: 'success',
          data: {
            car: result[0]
          }
        });
      }
    } catch (err) {
      console.error(`Erro ao consultar o carro com ID ${carId}:`, err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao consultar o banco de dados'
      });
    }
  });


//GET modelo-> para ir buscar um carro especifico pelo seu modelo
app.get('/Cars/modelo/:modelo', async (req, res) => {
    const carModel = req.params.modelo;
    try {
      console.log(`Consultando o carro com modelo ${carModel}...`);
      const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE modelo = ?', [carModel]);
      
      if (result.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Carro não encontrado'
        });
      } else {
        console.log('Resultado da consulta:', result);
        res.status(200).json({
          status: 'success',
          data: {
            car: result
          }
        });
      }
    } catch (err) {
      console.error(`Erro ao consultar o carro com modelo ${carModel}:`, err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao consultar o banco de dados'
      });
    }
  });

// GET marca-> para ir buscar os carros da mesma marca
  app.get('/Cars/marca/:marca', async (req, res) => {
    const carBrand = req.params.marca;
    try {
      console.log(`Consultando o carro com modelo ${carBrand}...`);
      const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE marca = ?', [carBrand]);
      
      if (result.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Carro não encontrado'
        });
      } else {
        console.log('Resultado da consulta:', result);
        res.status(200).json({
          status: 'success',
          data: {
            car: result
          }
        });
      }
    } catch (err) {
      console.error(`Erro ao consultar o carro com modelo ${carBrand}:`, err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao consultar o banco de dados'
      });
    }
  });

  // PATCH id- Para fazer atualizações aos dados já presentes na base de dados (usando o modelo para identificar)
  app.patch('/Cars/modelo/:modelo', async (req, res) => {
    const carModel = req.params.modelo;
    const {marca, id} = req.body;
   
  
    // Verifica se há pelo menos um campo para atualizar
    if (!marca && !id) {
      return res.status(400).json({
        status: 'error',
        message: 'Nenhum campo fornecido para atualização'
      });
    }
  
    try {
      console.log(`Atualizando o carro com modelo ${carModel}...`);
  
      // Construindo a query dinamicamente
      let updateFields = [];
      let queryParams = [];
  
      if (marca) {
        updateFields.push("marca = ?");
        queryParams.push(marca);
      }
  
      if (id) {
        updateFields.push("id = ?");
        queryParams.push(id);
      }
  
      if (updateFields.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum campo válido fornecido para atualização'
        });
      }
  
      queryParams.push(carModel); // Adiciona o modelo ao final dos parâmetros da query
  
      const query = `UPDATE CarsDB.CarsTable SET ${updateFields.join(', ')} WHERE modelo = ?`;
  
      const result = await executeQuery(query, queryParams);
  
      if (result.affectedRows === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Carro não encontrado para o modelo especificado'
        });
      } else {
        console.log('Carro atualizado com sucesso.');
        res.status(200).json({
          status: 'success',
          message: 'Carro atualizado com sucesso'
        });
      }
    } catch (err) {
      console.error(`Erro ao atualizar o carro com modelo ${carModel}:`, err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar o banco de dados'
      });
    }
  });
  
  
// Post -> para adicionar um novo carro
app.post('/Cars', async (req, res) => {
    const { id, marca, modelo } = req.body;
  
    // Verificar se todos os campos necessários estão presentes
    if (id === undefined || marca === undefined || modelo === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça id, marca e modelo do carro.'
      });
    }
  
    try {
      console.log(`Adicionando o carro com ID ${id}, marca ${marca}, e modelo ${modelo}...`);
  
      // Query para inserir um novo carro
      const query = 'INSERT INTO CarsDB.CarsTable (id, marca, modelo) VALUES (?, ?, ?)';
      const params = [id, marca, modelo];
  
      // Executar a query
      const result = await executeQuery(query, params);
  
      console.log('Carro adicionado com sucesso.');
      res.status(201).json({
        status: 'success',
        message: 'Carro adicionado com sucesso',
        data: {
          id,
          marca,
          modelo
        }
      });
    } catch (err) {
      console.error('Erro ao adicionar o carro:', err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao adicionar o carro no banco de dados'
      });
    }
  });
  
  
  
  
//DELETE ->para apagar os dados da base de dados
app.delete('/Cars/modelo/:modelo', async (req, res) => {
    const carModel = req.params.modelo;
  
    try {
      console.log(`Deletando o carro com modelo ${carModel}...`);
      
      
      const result = await executeQuery('DELETE FROM CarsDB.CarsTable WHERE modelo = ?', [carModel]);
  
      if (result.affectedRows === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Carro não encontrado'
        });
      } else {
        res.status(200).json({
          status: 'success',
          message: `Carro com modelo ${carModel} deletado com sucesso`
        });
      }
    } catch (err) {
      console.error(`Erro ao deletar o carro com modelo ${carModel}:`, err.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao deletar o carro no banco de dados'
      });
    }
  });
  


const port = 8080;
app.listen(port, () => {
    console.log('server has started ...');
});
