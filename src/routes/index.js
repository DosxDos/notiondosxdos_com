import express from 'express';
import ots_notion_controller from '../controllers/ots_notion_controller.js';

const router = express.Router();

// Enpoint POST de las OTS en NOTION
router.post('/ots_notion', async (req, res) => {
    const otsNotionController = new ots_notion_controller(req.body);
    const response = await otsNotionController.crearOt();
    res.status(response.code).json(response);
});

export default router;
