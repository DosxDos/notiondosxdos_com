import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno

frontendRouter.get('/login', (req, res) => {
  res.render('login', { layout: 'main' });
});

frontendRouter.get('/presupuesto/:codigoOT', async (req, res) => {
  try {
    const codigoOT = req.params.codigoOT;
    const apiRes = await axios.get(`http://localhost:${process.env.PORT}/api/presupuestoEscaparate/${codigoOT}`);
    const result = apiRes.data;

    if (!result.status) throw new Error(result.message);

    const datos = result.data?.data?.[0];
    if (!datos) return res.status(500).send('No se encontraron datos de la OT');

    res.render('presupuesto', {
      layout: 'main',
      ot: datos,
    });
  } catch (err) {
    console.error('❌ Error en /presupuesto/:codigoOT:', err);
    res.status(500).send('Error al cargar el presupuesto');
  }
});

export default frontendRouter;