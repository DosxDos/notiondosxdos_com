import express from 'express';
import ots_notion_controller from '../controllers/ots_notion_controller.js';

const router = express.Router();

// Enpoint POST de las OTS en NOTION
router.post('/ots_notion', async (req, res) => {
    const controller_ots_notion = new ots_notion_controller(res, req);
    await controller_ots_notion.crearOt();
});

export default router;

/*
// Registrar rutas principales
router.use('/webhook', webhookgithub); // Rutas específicas para el Webhook
// Ruta GET para verificar la webhook de GitHub
export const verficicar = router.get('/webhook/verificar', async (req, res) => {
    try {
        const response = [true, `Webhook verificado`, 200];
        res.status(200).json(response);
    } catch (error) {
        const response = [false, error.message, 500];
        res.status(500).json(response);
    }
});

// Ruta GET con parámetros de consulta (query string)
router.get('/data', async (req, res) => {
    const queryParams = req.query;
    try {
        const result = await getHandler(queryParams);
        const codRespuesta = result[2];
        res.status(codRespuesta).json(result);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

// Ruta POST para manejar datos JSON
router.post('/data', async (req, res) => {
    const data = req.body;
    try {
        const result = await postHandler(data);
        const codRespuesta = result[2];
        res.status(codRespuesta).json(result);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

// Ruta PUT para manejar datos JSON
router.put('/data', async (req, res) => {
    const data = req.body;
    try {
        const result = await putHandler(data);
        const codRespuesta = result[2];
        res.status(codRespuesta).json(result);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

// Ruta DELETE para manejar datos JSON
router.delete('/data', async (req, res) => {
    const data = req.body;
    try {
        const result = await deleteHandler(data);
        const codRespuesta = result[2];
        res.status(codRespuesta).json(result);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});
*/