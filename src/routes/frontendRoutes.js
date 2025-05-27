import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../security/authMiddleware.js';

dotenv.config(); // Cargar variables de entorno

frontendRouter.get('/presupuesto/:codigoOT', verifyJWT, (req, res) => {
  console.log('Ruta /presupuesto/:codigoOT accedida con código:', req.params.codigoOT);
  res.render('nueva_ot', {
    layout: 'main',
    title: 'Crear Presupuesto',
    codigoOT: req.params.codigoOT
  });
});

export default frontendRouter;