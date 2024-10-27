const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const getHandler = require('./getHandler');
const postHandler = require('./postHandler');
const putHandler = require('./putHandler');
const deleteHandler = require('./deleteHandler');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware para analizar cuerpos JSON
app.use(express.json());

// Middleware para analizar cuerpos application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Función para manejar respuestas de error de forma consistente en JSON
function handleErrorResponse(res, error) {
  const respuesta = [];
  respuesta[0] = false;
  respuesta[1] = error.message;
  respuesta[2] = 500;
  res.status(500).json(respuesta);
}

// Ruta GET con múltiples parámetros en la query string
app.get('/api', async (req, res) => {
  const queryParams = req.query;
  try {
    const result = await getHandler(queryParams);
    codRespuesta = result[2];
    res.status(codRespuesta).json(result);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Ruta POST que recibe un cuerpo JSON
app.post('/api', async (req, res) => {
  const data = req.body;
  try {
    const result = await postHandler(data);
    codRespuesta = result[2];
    res.status(codRespuesta).json(result);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Ruta PUT que recibe un cuerpo JSON
app.put('/api', async (req, res) => {
  const data = req.body;
  try {
    const result = await putHandler(data);
    codRespuesta = result[2];
    res.status(codRespuesta).json(result);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Ruta DELETE que recibe un cuerpo JSON
app.delete('/api', async (req, res) => {
  const data = req.body;
  try {
    const result = await deleteHandler(data);
    codRespuesta = result[2];
    res.status(codRespuesta).json(result);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Ruta principal para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para manejar rutas no definidas
app.use((req, res, next) => {
  const error = [];
  error[0] = false;
  error[1] = "El link solicitado no existe en la API";
  error[2] = "404";
  res.status(404).json(error);
});
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});