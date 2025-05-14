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

export default router;