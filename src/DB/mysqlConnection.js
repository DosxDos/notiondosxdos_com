// ESTO ESTÁ GENIAL PARA ACCEDER A LAS BASES DE DATOS SQL, PERO SE DEBE CONTINUAR SU DESARROLLO Y UNAS MEJORAS PARA QUE SEA MÁS PRÁCTICO - POR EJEMPLO SERÍA MUY PRÁCTICO SÓLO EJECUTAR CONNECT() Y QUE TE DEVUELVA UNA CONEXIÓN SI YA EXISTE O SINO TE DEVUELVA UNA NUEVA CONEXIÓN, DIRECTAMENTE - ANDRÉS   
// Archivo: DB/mysqlConnection.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class MySQLConnection {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = await mysql.createConnection({
                host: process.env.SQL_DB_HOST,
                user: process.env.SQL_DB_USER,
                password: process.env.SQL_DB_PASSWORD,
                database: process.env.SQL_DB_NAME,
            });

            console.log('🟢 Conexión a MySQL establecida');
        }
        return this.connection;
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('🔴 Conexión a MySQL cerrada');
        }
    }

    getConnection() {
        if (!this.connection) {
            throw new Error('❌ La conexión aún no ha sido establecida. Llama a connect() primero.');
        }
        return this.connection;
    }
}

// Exportar una instancia singleton
export const db = new MySQLConnection();
