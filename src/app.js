import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
const app = express();
dotenv.config(); // Cargar variables de entorno
import router from './routes/index.js';

// Middlewares globales
app.use(express.json()); // Analizar cuerpos application/json
app.use(express.urlencoded({ extended: true })); // Analizar cuerpos application/x-www-form-urlencoded

// Usar rutas principales
app.use('/api', router);

// Validar variables de entorno
if (!process.env.PORT) {
  console.error('Error: No se encontró el archivo .env o la variable PORT no está definida.');
  process.exit(1); // Finaliza el proceso
}

export default app;