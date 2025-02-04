const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ruta para subir archivos y datos
app.post("/upload", upload.single("file"), (req, res) => {
  const { nombre, descripcion } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  const fileData = {
    nombre,
    descripcion,
    fileUrl: `http://localhost:${PORT}/uploads/${file.filename}`,
  };

  res.json({ message: "Archivo subido correctamente", data: fileData });
});

// Servir archivos estáticos
app.use("/uploads", express.static("uploads"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
