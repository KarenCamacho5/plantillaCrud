const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde el frontend
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors()); // Habilita CORS

const DATA_FILE_PATH = path.join(__dirname, '../src/assets/data.json');


/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Función para leer los datos desde el archivo JSON
 * @returns {Object} Datos del archivo JSON
 */
const readData = () => {
  const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  return JSON.parse(data);
};

/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Función para escribir datos en el archivo JSON
 * @param {Object} data - Datos actualizados que se escribirán en el JSON
 */
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Endpoint para obtener todas las campañas
 * @route GET /api/campaigns
 * @returns {Array} Lista de campañas
 */
app.get('/api/campaigns', (req, res) => {
  const data = readData();
  res.json(data.crudConfig.campaigns);
});

/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Endpoint para obtener una campaña específica por ID
 * @route GET /api/campaigns/:id
 * @param {number} id - ID de la campaña a obtener
 * @returns {Object} Campaña encontrada o mensaje de error
 */
app.get('/api/campaigns/:id', (req, res) => {
  const data = readData();
  const campaign = data.crudConfig.campaigns.find((c) => c.id === parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ message: 'Campaña no encontrada' });
  }
  res.json(campaign);
});


/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Endpoint para crear una nueva campaña
 * @route POST /api/campaigns
 * @param {Object} req.body - Datos de la nueva campaña
 * @returns {Object} Campaña creada o mensaje de error
 */
app.post('/api/campaigns', (req, res) => {
  const { name, date, status, file, agreement } = req.body;

  if (!name || !date || !status || !file || !agreement) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const data = readData();
  const newCampaign = {
    id: data.crudConfig.campaigns.length > 0 ? Math.max(...data.crudConfig.campaigns.map(c => c.id)) + 1 : 1,
    name,
    date,
    status,
    file,
    agreement,
  };

  data.crudConfig.campaigns.push(newCampaign);
  writeData(data);

  res.status(201).json(newCampaign);
});

/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Endpoint para actualizar una campaña existente
 * @route PUT /api/campaigns/:id
 * @param {number} id - ID de la campaña a actualizar
 * @param {Object} req.body - Datos actualizados de la campaña
 * @returns {Object} Campaña actualizada o mensaje de error
 */
app.put('/api/campaigns/:id', (req, res) => {
  const { name, date, status, file, agreement } = req.body;
  const data = readData();
  const campaignIndex = data.crudConfig.campaigns.findIndex((c) => c.id === parseInt(req.params.id));

  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaña no encontrada' });
  }

  data.crudConfig.campaigns[campaignIndex] = { ...data.crudConfig.campaigns[campaignIndex], name, date, status, file, agreement };
  writeData(data);

  res.json(data.crudConfig.campaigns[campaignIndex]);
});

/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Endpoint para eliminar una campaña por ID
 * @route DELETE /api/campaigns/:id
 * @param {number} id - ID de la campaña a eliminar
 * @returns {void} Confirma la eliminación
 */
app.delete('/api/campaigns/:id', (req, res) => {
  const data = readData();
  data.crudConfig.campaigns = data.crudConfig.campaigns.filter((c) => c.id !== parseInt(req.params.id));

  writeData(data);
  res.status(204).send();
});

const PORT = 3000;
/**
 * @author Karen Camacho
 * @createdate 2025/02/04
 * Inicia el servidor en el puerto definido
 */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
