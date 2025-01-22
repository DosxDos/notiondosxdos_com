import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const app = express();
dotenv.config(); // Cargar variables de entorno
import router from './routes/index.js';
import respuesta from './utils/respuesta_util.js';

// Obtener __filename y __dirname en módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json()); // Analizar cuerpos application/json
app.use(express.urlencoded({ extended: true })); // Analizar cuerpos application/x-www-form-urlencoded

// Usar rutas principales
app.use('/api', router);

// Servir archivos estáticos desde la carpeta "public" (Documentación de la api)
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal para servir el archivo estático index de la carpeta "public" (Documentación de la api)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoints solicitados que no están definidos en el backend
app.use((req, res, next) => {
  const respuestas = new respuesta('El endpoint solicitado no existe');
  const response = respuestas._404();
  res.status(response.code).json(response);
});

// Validar variables de entorno
if (!process.env.PORT) {
  console.error('Error: No se encontró el archivo .env o la variable PORT no está definida.');
  process.exit(1); // Finaliza el proceso
}

export default app;