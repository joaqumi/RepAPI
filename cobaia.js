
       const express = require('express'); //extensão que premite usar GET/POST/...
const mysql = require('mysql2/promise'); //extensão que permite a ligação com a Base de Dados na cloud
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
    const [results] = await connection.execute(query, params);
    return results;
  } catch (err) {
    console.error('Erro ao executar a consulta:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

// Função auxiliar para enviar resposta de erro
function handleError(res, errMsg, statusCode = 500) {
  console.error(errMsg);
  res.status(statusCode).json({ status: 'error', message: errMsg });
}

// GET -> para obter todos os carros
app.get('/Cars', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable');
    res.status(200).json({ status: 'success', data: { cars: result } });
  } catch (err) {
    handleError(res, 'Erro ao consultar todos os carros');
  }
});

// GET id -> para obter um carro pelo ID
app.get('/Cars/:id', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE id = ?', [req.params.id]);
    if (result.length === 0) {
      res.status(404).json({ status: 'error', message: 'Carro não encontrado' });
    } else {
      res.status(200).json({ status: 'success', data: { car: result[0] } });
    }
  } catch (err) {
    handleError(res, `Erro ao consultar o carro com ID ${req.params.id}`);
  }
});

// GET modelo -> para obter um carro pelo modelo
app.get('/Cars/modelo/:modelo', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE modelo = ?', [req.params.modelo]);
    if (result.length === 0) {
      res.status(404).json({ status: 'error', message: 'Carro não encontrado' });
    } else {
      res.status(200).json({ status: 'success', data: { car: result } });
    }
  } catch (err) {
    handleError(res, `Erro ao consultar o carro com modelo ${req.params.modelo}`);
  }
});

// GET marca -> para obter carros pela marca
app.get('/Cars/marca/:marca', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM CarsDB.CarsTable WHERE marca = ?', [req.params.marca]);
    if (result.length === 0) {
      res.status(404).json({ status: 'error', message: 'Carro não encontrado' });
    } else {
      res.status(200).json({ status: 'success', data: { car: result } });
    }
  } catch (err) {
    handleError(res, `Erro ao consultar carros com marca ${req.params.marca}`);
  }
});

// PATCH -> para atualizar um carro pelo modelo
app.patch('/Cars/modelo/:modelo', async (req, res) => {
  const { marca, id } = req.body;
  const carModel = req.params.modelo;

  if (!marca && !id) return res.status(400).json({ status: 'error', message: 'Nenhum campo fornecido para atualização' });

  try {
    const updateFields = [];
    const queryParams = [];

    if (marca) { updateFields.push('marca = ?'); queryParams.push(marca); }
    if (id) { updateFields.push('id = ?'); queryParams.push(id); }

    if (updateFields.length === 0) return res.status(400).json({ status: 'error', message: 'Nenhum campo válido fornecido para atualização' });

    queryParams.push(carModel);
    const query = `UPDATE CarsDB.CarsTable SET ${updateFields.join(', ')} WHERE modelo = ?`;
    const result = await executeQuery(query, queryParams);

    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Carro não encontrado para o modelo especificado' });
    } else {
      res.status(200).json({ status: 'success', message: 'Carro atualizado com sucesso' });
    }
  } catch (err) {
    handleError(res, `Erro ao atualizar o carro com modelo ${carModel}`);
  }
});

// POST -> para adicionar um novo carro
app.post('/Cars', async (req, res) => {
  const { id, marca, modelo } = req.body;

  if (id === undefined || marca === undefined || modelo === undefined) {
    return res.status(400).json({ status: 'error', message: 'Por favor, forneça id, marca e modelo do carro.' });
  }

  try {
    const query = 'INSERT INTO CarsDB.CarsTable (id, marca, modelo) VALUES (?, ?, ?)';
    await executeQuery(query, [id, marca, modelo]);
    res.status(201).json({ status: 'success', message: 'Carro adicionado com sucesso', data: { id, marca, modelo } });
  } catch (err) {
    handleError(res, 'Erro ao adicionar o carro no banco de dados');
  }
});

// DELETE -> para deletar um carro pelo modelo
app.delete('/Cars/modelo/:modelo', async (req, res) => {
  try {
    const result = await executeQuery('DELETE FROM CarsDB.CarsTable WHERE modelo = ?', [req.params.modelo]);
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Carro não encontrado' });
    } else {
      res.status(200).json({ status: 'success', message: `Carro com modelo ${req.params.modelo} deletado com sucesso` });
    }
  } catch (err) {
    handleError(res, `Erro ao deletar o carro com modelo ${req.params.modelo}`);
  }
});

//Abre uma porta por onde a API vai passar
const port = 8080;
app.listen(port, () => console.log(`Servidor iniciado na porta ${port}`));
