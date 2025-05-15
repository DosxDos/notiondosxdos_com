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
