import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

class MongoDB {
  constructor() {
    dotenv.config(); // Cargar las variables de entorno desde el archivo .env
    const uri = process.env.MONGO_URI; // URL de conexión a tu base de datos
    this.dbName = process.env.DB_NAME; // Nombre de tu base de datos
    this.client = new MongoClient(uri); // Cliente de MongoDB
    this.db = null; // Inicializar la base de datos como null
  }

  async connect() {
    try {
      await this.client.connect(); // Establecer la conexión
      this.db = this.client.db(this.dbName); // Establecer la base de datos en la propiedad `this.db`
      console.log('Conexión a MongoDB establecida.');
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error);
      throw error;
    }
  }

  async create(collectionName, document) {
    try {
      const collection = this.db.collection(collectionName); // Obtener la colección
      const result = await collection.insertOne(document); // Insertar documento
      console.log('Documento insertado:', result);
      return result;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  }

  async read(collectionName, query) {
    try {
      const collection = this.db.collection(collectionName); // Obtener la colección
      const result = await collection.find(query).toArray(); // Buscar documentos
      console.log('Documentos encontrados:', result);
      return result;
    } catch (error) {
      console.error('Error al leer documentos:', error);
      throw error;
    }
  }

  async update(collectionName, query, updateDoc) {
    try {
      const collection = this.db.collection(collectionName); // Obtener la colección
      const result = await collection.updateOne(query, { $set: updateDoc }); // Actualizar documento
      console.log('Documento actualizado:', result);
      return result;
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  }

  async delete(collectionName, query) {
    try {
      const collection = this.db.collection(collectionName); // Obtener la colección
      const result = await collection.deleteOne(query); // Eliminar documento
      console.log('Documento eliminado:', result);
      return result;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  async upsertByCodigo(collectionName, C_digo, body) {
    try {
      const collection = this.db.collection(collectionName);

      // Buscar un documento con el C_digo proporcionado
      const existingDocument = await collection.findOne({ "data.C_digo": C_digo });

      console.log('Documento existente:', existingDocument);

      if (!existingDocument) {
        // Si no existe el documento, creamos uno nuevo
        const result = await collection.insertOne(body);
        console.log('Documento creado:', result);
        return result;
      } else {
        // Si el documento existe, comparamos los valores
        if (JSON.stringify(existingDocument) === JSON.stringify(body.data)) {
          console.log('El documento ya es igual, no se requiere ninguna actualización.');
          return false; // No se hace nada si todo es igual
        } else {
          // Si no es igual, actualizamos el documento
          const result = await collection.updateOne(
            { C_digo }, // Buscar por C_digo
            { $set: body } // Actualizar con el nuevo body
          );
          console.log('Documento actualizado:', result);
          return result;
        }
      }
    } catch (error) {
      console.error('Error al verificar y actualizar el documento:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.client.close(); // Cerrar la conexión
      console.log('Conexión cerrada.');
    } catch (error) {
      console.error('Error al cerrar la conexión:', error);
      throw error;
    }
  }
}

export default MongoDB;
