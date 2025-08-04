import dotenv from 'dotenv';
import express from 'express';
import MongoDB from './DB/MongoDB.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { engine } from 'express-handlebars';
import cookieParser from 'cookie-parser';
const app = express();
dotenv.config(); // Cargar variables de entorno
import router from './routes/index.js';
import respuesta from './utils/respuesta_util.js';
import { exec } from 'child_process';
import { verifyJWT } from './security/authMiddleware.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

app.use(express.json({ limit: '10mb' })); //Cambiar el límite de tamaño del cuerpo de la solicitud a 10mb
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Cambiar el límite de tamaño del cuerpo de la solicitud a 10mb

// Obtener __filename y __dirname en módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos desde la carpeta "public" (Documentación de la api)
app.use(express.static(path.join(__dirname, '../public')));

app.use(verifyJWT); // 🔒 Esto se aplica a TODAS las rutas EXCEPTO los archivos estáticos

// Crear una única instancia de MongoDB (Singleton)
const mongo = new MongoDB();

// Conectar a la base de datos de MongoDB
mongo.connect();

app.use(express.json()); // Analizar cuerpos application/json
app.use(express.urlencoded({ extended: true })); // Analizar cuerpos application/x-www-form-urlencoded

// Usar rutas principales
app.use('/api', router);

// Configurar Handlebars
app.engine('handlebars', engine({
  partialsDir: path.join(__dirname, '../public/views/partials'),
  helpers: {
    json: (context) => JSON.stringify(context, null, 2),
    range: function (from, to) {
      const result = [];
      for (let i = from; i <= to; i++) {
        result.push(i);
      }
      return result;
    },
    concat: function (...args) {
      args.pop();
      return args.join('');
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../public/views'));

// Ruta principal para servir el archivo estático index de la carpeta "public" (Documentación de la api)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enpoint GET de las vistas del fronted de presupuestos de escaparates
app.get('/presupuesto/:codigoOT', verifyJWT, (req, res) => {
  console.log('Ruta /presupuesto/:codigoOT accedida con código:', req.params.codigoOT);
  res.render('nueva_ot', {
    layout: 'main',
    title: 'Crear Presupuesto',
    codigoOT: req.params.codigoOT
  });
});

// Ruta GET para verificar el webhook de github
app.get('/verificar', async (req, res) => {
  try {
    const response = [true, `verificar 18`, 200];
    res.status(200).json(response);
  } catch (error) {
    const response = [false, error, 500];
    res.status(500).json(response);
  }
});

// Ruta POST para el webhook de GitHub
app.post('/webhookgithub', (req, res) => {
  console.log("Webhook recibido: Iniciando git pull...");

  // Responder inmediatamente a Apache para evitar timeout
  res.status(200).json({ success: true, message: "Proceso de actualización iniciado" });

  // Ejecutar git pull y pm2 restart en segundo plano
  ejecutarWebHook();
});

// Función para ejecutar git pull y pm2 restart en segundo plano
const ejecutarWebHook = async () => {
  try {
    const responsePull = await executeGitPull();
    console.log(responsePull.message);

    if (responsePull.success) {
      const responsePm2 = await executePm2Restart();
      console.log(responsePm2.message);
    }
  } catch (error) {
    console.error(`Error en el Webhook: ${error.message}`);
  }
};

// Función para ejecutar git pull
function executeGitPull() {
  return new Promise((resolve) => {
    const projectDir = 'P:\\apache\\htdocs\\notiondosxdos';
    const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';

    exec(`powershell -Command "& {cd '${projectDir}'; & '${gitPath}' pull}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando git pull: ${stderr}`);
        return resolve({ success: false, message: 'Error ejecutando git pull', status: 500 });
      }
      console.log(`Salida de git pull: ${stdout}`);
      return resolve({ success: true, message: 'git pull ejecutado con éxito', status: 200 });
    });
  });
}

// Función para ejecutar pm2 restart después de git pull
function executePm2Restart() {
  return new Promise((resolve) => {
    const pm2Path = 'C:\\Users\\Andres\\AppData\\Roaming\\npm\\pm2.cmd';

    exec(`powershell -Command "& {& '${pm2Path}' restart '0'}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando pm2 restart: ${stderr}`);
        return resolve({ success: false, message: 'Error ejecutando pm2 restart', status: 500 });
      }
      console.log(`Salida de pm2 restart: ${stdout}`);
      return resolve({ success: true, message: 'pm2 restart ejecutado con éxito', status: 200 });
    });
  });
}

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