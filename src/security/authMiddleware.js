import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {db} from '../DB/mysqlConnection.js';
import bcrypt from 'bcrypt'; // o 'bcryptjs'

dotenv.config();

// Cargar variables de entorno desde el archivo .env
const SECRET_KEY = process.env.JWT_SECRET; // Usa variable de entorno en producción

export const verifyJWT = (req, res, next) => {
    // Definir rutas públicas. Para rutas con parámetros, comprobamos el inicio.
    const publicPathsExact = [
        '/api/login',
        '/login'
    ];
    
    const isPublicPath = publicPathsExact.includes(req.path);

    console.log(`[verifyJWT] Solicitud a: ${req.method} ${req.path}`);
    console.log(`[verifyJWT] ¿Es ruta pública? ${isPublicPath}`);

    // Si es una ruta pública, no necesitamos el JWT
    if (isPublicPath) {
        console.log(`[verifyJWT] Ruta pública, saltando verificación JWT.`);
        return next(); // Ruta pública, no requiere token
    }

    console.log(`[verifyJWT] Ruta protegida, verificando token...`);

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
        token = req.query.token;  // El token se pasa como parámetro en la URL
    }

    // 4. También buscamos en las cookies si existe
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    console.log(`[verifyJWT] Token encontrado: ${token ? 'Sí' : 'No'}`);

    // Si no encontramos el token en ningún lugar
    if (!token) {
        console.log(`[verifyJWT] Token no encontrado, redirigiendo a login.`);
        
        // Si es una solicitud de API, enviar 401
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Token no proporcionado o inválido' });
        }
        
        // Si es una solicitud de página, redirigir a login
        return res.redirect('/login');
    }

    // Verificamos el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Guardamos los datos del usuario decodificados en req.user
        console.log(`[verifyJWT] Token verificado con éxito para usuario: ${decoded.email}`);
        next();  // Continuamos con la siguiente función
    } catch (error) {
        console.error(`[verifyJWT] Error verificando token: ${error.message}`);
        
        // Si es una solicitud de API, enviar 401
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
        }
        
        // Si es una solicitud de página, redirigir a login
        return res.redirect('/login');
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