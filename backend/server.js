const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;
const DB_FILE = 'database.json';

// Middlewares
app.use(cors());
app.use(express.json());

// Función para leer la base de datos
const readDatabase = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

// Función para escribir en la base de datos
const writeDatabase = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// 📌 Crear una nueva "tabla" (colección)
app.post('/create-collection', (req, res) => {
    const { collectionName } = req.body;
    let db = readDatabase();

    if (db[collectionName]) {
        return res.status(400).json({ error: "La colección ya existe" });
    }

    db[collectionName] = [];
    writeDatabase(db);
    res.json({ message: `Colección '${collectionName}' creada` });
});

// 📌 Obtener datos de una colección
app.get('/:collectionName', (req, res) => {
    let db = readDatabase();
    const { collectionName } = req.params;

    if (!db[collectionName]) {
        return res.status(404).json({ error: "Colección no encontrada" });
    }

    res.json(db[collectionName]);
});

// 📌 Agregar un nuevo documento a una colección
app.post('/:collectionName', (req, res) => {
    let db = readDatabase();
    const { collectionName } = req.params;
    const data = req.body;

    if (!db[collectionName]) {
        return res.status(404).json({ error: "Colección no encontrada" });
    }

    data.id = Date.now(); // Generar un ID único
    db[collectionName].push(data);
    writeDatabase(db);
    res.json(data);
});

// 📌 Editar un documento por ID
app.put('/:collectionName/:id', (req, res) => {
    let db = readDatabase();
    const { collectionName, id } = req.params;
    const updateData = req.body;

    if (!db[collectionName]) {
        return res.status(404).json({ error: "Colección no encontrada" });
    }

    let collection = db[collectionName];
    let index = collection.findIndex(item => item.id == id);

    if (index === -1) {
        return res.status(404).json({ error: "Documento no encontrado" });
    }

    db[collectionName][index] = { ...collection[index], ...updateData };
    writeDatabase(db);
    res.json(db[collectionName][index]);
});

// 📌 Eliminar un documento por ID
app.delete('/:collectionName/:id', (req, res) => {
    let db = readDatabase();
    const { collectionName, id } = req.params;

    if (!db[collectionName]) {
        return res.status(404).json({ error: "Colección no encontrada" });
    }

    db[collectionName] = db[collectionName].filter(item => item.id != id);
    writeDatabase(db);
    res.json({ message: `Documento con ID ${id} eliminado` });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
