import express from 'express';
import multer from 'multer';
import ots_notion_controller from '../controllers/ots_notion_controller.js';
import ots_crmzoho_controller from '../controllers/ots_crmzoho_controller.js';
import leads_crm from '../controllers/ots_crmzoho_controller.js';
import presupuesto_notion_controller from '../controllers/presupuesto_notion_controller.js';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise';
import { generarTokenSinExpiracion } from '../security/authMiddleware.js';
import { equal } from 'assert';
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno


const router = express.Router();

// Ruta absoluta segura a la carpeta uploads
const uploadsDir = path.resolve('uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configurar Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `escaparate_${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// Este sería el login de la API (Solo se utiliza para obtener un bearer token)
router.post('/login', async (req, res) => {
    //el email será cualquiera y la contraseña deberá ser la contraseña JWT Privada
    const { email, password } = req.body;

    try {
        // Generar token
        const token = await generarTokenSinExpiracion(req.body);

        // Guardar token en cookies para navegación segura
        res.cookie('token', token, {
            httpOnly: true,  // Solo accesible por el servidor
            secure: process.env.NODE_ENV === 'production',  // Solo HTTPS en producción
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
        });

        // Devolver el token
        return res.status(200).json({ token });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ message: 'Error al realizar el login', error: error.message });
    }
});

/**
 * Estas son las peticiones de OTS de Notion
 */

// Enpoint POST de las OTS en NOTION
router.post('/ots_notion', async (req, res) => {
    const otsNotionController = new ots_notion_controller(req.body);
    const response = await otsNotionController.crearOt();
    res.status(response.code).json(response);
});
//Endpoint PUT de las OTS en NOTION
router.put('/ots_notion', async (req, res) => {
    const otsNotionController = new ots_notion_controller(req.body);
    const response = await otsNotionController.putOt();
    res.status(response.code).json(response);
});

//Endpoint DELETE de las OTS en NOTION
router.delete('/ots_notion', async (req, res) => {
    const otsNotionController = new ots_notion_controller(req.body);
    const response = await otsNotionController.deleteOt();
    res.status(response.code).json(response);
});

/**
 * Estas son las peticiones de OTS de Zoho
 */

// Endpoint para crear la OT en Zoho CRM
router.post('/ots_crm', async (req, res) => {
    console.log("Se esta creando una OT de NOTION a CRM")
    const otsNotionController = new ots_crmzoho_controller(req.body);
    const response = await otsNotionController.crearOt();
    res.status(response.code).json(response);
});
//Endpoint PUT de las OTS en NOTION
router.put('/ots_crm', async (req, res) => {
    const otsNotionController = new ots_crmzoho_controller(req.body);
    const response = await otsNotionController.putOt();
    res.status(response.code).json(response);
});

//Endpoint DELETE de las OTS en NOTION
router.delete('/ots_crm', async (req, res) => {
    const otsNotionController = new ots_crmzoho_controller(req.body);
    const response = await otsNotionController.deleteOt();
    res.status(response.code).json(response);
});

/**
 * FIN DE LAS PETICIONES DE OTS
 */


//Endpoint GET de los Montadores en NOTION
router.get('/leads_crm', async (req, res) => {
    console.log('GET /leads_crm');
    const leadsCrm = new leads_crm(req.body);
    const response = await leadsCrm.crearOt();
    res.status(response.code).json(response);
});

//Esto solo verifica que vaya todo bien
router.get('/prueba', async (req, res) => {
    res.status(200).json({ success: true, message: "Prueba exitosa" });
});

/**
 * Estas son las peticiones Custom como por ejemplo crear presupuestos, etc
 */

// Enpoint GET de las OTS en NOTION
router.get('/presupuestoEscaparate/:codigoOT', async (req, res) => {
    const presupuestoNotionController = new presupuesto_notion_controller({ codigoOT: req.params.codigoOT });
    const response = await presupuestoNotionController.crearFormularioDeOtEscaparate();
    res.status(response.code).json(response);
});

// Este endpoint genera el PDF del presupuesto
router.post('/descargarPresupuesto', async (req, res) => {
    const controller = new presupuesto_notion_controller(req.body);
    await controller.generarPDFdePresupuesto(req, res);
});

//convierte el excel de precios de escaparate un json y lo sube a la base de datos de mySQL
router.post('/subirExcelPreciosEscaparate', upload.single('archivoExcel'), async (req, res) => {
    try {
        const controller = new presupuesto_notion_controller();
        const resultado = await controller.subirPreciosEscaparate(req.file.path);
        res.status(200).json({ mensaje: resultado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir y procesar el archivo' });
    }
});

//convierte el excel de precios de escaparate un json y lo sube a la base de datos de mySQL
router.post('/crear/presupuesto/ot', upload.single('archivoExcel'), async (req, res) => {
    try {
        const controller = new ots_notion_controller(req.body);
        const resultado = await controller.crearOtEscaparate();
        res.status(200).json({ mensaje: resultado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el presupuesto de la ot' });
    }
});

// Enpoint GET de las OTS en NOTION
router.get('/materialesPresupuesto', async (req, res) => {
    const presupuestoNotionController = new presupuesto_notion_controller();

    try {
        const materiales = await presupuestoNotionController.getMaterialesMySql();
        res.status(200).json(materiales);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los materiales del presupuesto',
            error: error.message
        });
    }
});


//recoge todos los puntos de venta de zoho y los convierte a un json
router.get('/recogerModuloZoho', async (req, res) => {
    try {
        var criteria = null;
        const modulo = req.query.modulo; // ← Aquí recoges el módulo desde el query param
        if (!modulo) {
            return res.status(400).json({ error: 'Falta el parámetro "modulo".' });
        }

        if (req.query.criteria) {
            console.log("Criteria: ", req.query.criteria)
            criteria = req.query.criteria; // Parsear el JSON
        }

        //Pruebas para ver que devuelve el modulo y el criteria
        //console.log("Modulo: ", modulo);
        //console.log("Criteria: ", criteria);

        const controller = new presupuesto_notion_controller();
        const resultado = await controller.recogerModuloZoho(modulo, criteria); // ← Se lo pasas aquí

        if (resultado.success) {
            res.status(200).json({
                mensaje: resultado.message,
                proveedores: resultado.data,
            });
        } else {
            res.status(400).json({
                mensaje: resultado.message,
                error: resultado.error || 'Error desconocido',
            });
        }
    } catch (error) {
        console.error('❌ Error en la ruta /recogerModuloZoho:', error.message);
        res.status(500).json({
            error: 'Error interno al conectar con Zoho.',
        });
    }
});


export default router;