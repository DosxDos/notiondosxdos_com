import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {db} from '../DB/mysqlConnection.js';
import bcrypt from 'bcrypt';

dotenv.config();

// Cargar variables de entorno desde el archivo .env
const SECRET_KEY = process.env.JWT_SECRET; // Usa variable de entorno en producción

export const verifyJWT = (req, res, next) => {
    const publicPaths = ['/api/login']; // puedes extender esto

    // Si es una ruta pública, no necesitamos el JWT
    if (publicPaths.includes(req.path)) {
        return next(); // Ruta pública, no requiere token
    }

    // 1. Intentamos obtener el token de la cabecera (Authorization)
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    // 2. Si no está en la cabecera, lo buscamos en el cuerpo de la solicitud (req.body)
    if (!token && req.body && req.body.token)  
    {
        token = req.body.token.split(' ')[1];  // El token debe estar en el cuerpo como JSON
    }

    // 3. Si no está ni en cabecera ni en el cuerpo, lo buscamos como parámetro en la URL
    if (!token && req.query.token) {
        token = req.query.token.split(' ')[1];  // El token se pasa como parámetro en la URL
    }

    // Si no encontramos el token en ningún lugar
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    // Verificamos el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Guardamos los datos del usuario decodificados en req.user
        next();  // Continuamos con la siguiente función
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
    }
};


export const generarTokenSinExpiracion = async (usuario) => {
    try {
        //console.log('🔑 Generando token sin expiración para el usuario:', usuario);
        const usuarioDB = await verificarCredenciales(usuario.email, usuario.password);
        return generarToken(usuarioDB);
    } catch (error) {
        console.error('❌ Error generando token:', error.message);
        throw error;
    }
};

// Buscar y verificar credenciales
export const verificarCredenciales = async (email, password) => {
    const connection = await db.connect();

    const [rows] = await connection.execute(
        'SELECT * FROM usuarios WHERE email = ?', 
        [email]
    );

    if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }
    const usuarioDB = rows[0];

    // Verificar si la contraseña es correcta
    //console.log('contraseña mandada:', usuarioDB.contrasena);
    //console.log('contraseña de la bbdd:', password);

    const passwordValida = await bcrypt.compare(password, usuarioDB.contrasena);

    //console.log('contraseña valida:', passwordValida);

    if (!passwordValida) {
        throw new Error('Contraseña incorrecta');
    }

    if (!usuarioDB.admin) {
        throw new Error('No tienes permisos para acceder a esta ruta');
    }

    return usuarioDB;
};

// Generar JWT sin expiración
export const generarToken = (usuarioDB) => {
    console.log('🔑 Generando token para el usuario:', usuarioDB);
    const payload = {
        id: usuarioDB.id,
        email: usuarioDB.email,
        role: usuarioDB.admin ? 'admin' : 'user'
    }
    return jwt.sign(payload, process.env.JWT_SECRET);
};