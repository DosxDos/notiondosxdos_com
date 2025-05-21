import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno

frontendRouter.get('/login', (req, res) => {
  res.render('login', { layout: 'main' });
});

frontendRouter.get('/presupuestos', (req, res) => {
  try {
    res.render('dashboard', { 
      layout: 'main',
      title: 'Presupuestos'
    });
  } catch (error) {
    console.error('Error al renderizar dashboard:', error);
    res.status(500).send('Error al cargar la página: ' + error.message);
  }
});

frontendRouter.get('/nueva-ot', (req, res) => {
  res.render('nueva_ot', {
    layout: 'main',
    title: 'Nueva OT'
  });
});

frontendRouter.get('/presupuesto/:codigoOT', async (req, res) => {
  try {
    const codigoOT = req.params.codigoOT;
    const apiRes = await axios.get(`http://localhost:${process.env.PORT}/api/presupuestoEscaparate/${codigoOT}`);
    const result = apiRes.data;

    if (!result.status) throw new Error(result.message);

    const datos = result.data?.data?.[0];
    if (!datos) return res.status(500).send('No se encontraron datos de la OT');

    res.render('ot_existente', {
      layout: 'main',
      ot: datos,
    });
  } catch (err) {
    console.error('❌ Error en /presupuesto/:codigoOT:', err);
    res.status(500).send('Error al cargar el presupuesto');
  }
});

export default frontendRouter;