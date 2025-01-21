import express from 'express';
import respuesta from '../utils/respuesta_util.js';
import ots_notion_controller from '../controllers/ots_notion_controller.js';

const router = express.Router();

// Enpoint POST de las OTS en NOTION
router.post('/ots_notion', async (req, res) => {
    const otsNotionController = new ots_notion_controller(res, req);
    await otsNotionController.crearOt();
});

export default router;