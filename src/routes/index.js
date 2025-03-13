import express from 'express';
import ots_notion_controller from '../controllers/ots_notion_controller.js';
import ots_crmzoho_controller from '../controllers/ots_crmzoho_controller.js';
import leads_crm from '../controllers/ots_crmzoho_controller.js';

const router = express.Router();

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

export default router;