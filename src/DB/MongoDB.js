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

  async createIfNotExists(collectionName, C_digo, body) {
    try {
        console.log('Verificando si el documento ya existe...');
        const collection = this.db.collection(collectionName);

        // Buscar el documento completo, si no existe lo creamos
        const document = await collection.findOne({}); // Aquí puedes agregar un filtro si lo necesitas

        // Si no existe el documento, lo creamos
        if (!document) {
            console.log('Documento no encontrado, creando uno nuevo...');
            const newDocument = { data: body.data };  // Insertamos 'data' directamente como un array de objetos
            const result = await collection.insertOne(newDocument);
            console.log('Documento creado:', result);
            return result;  // Retornamos el documento recién creado
        }

        // Si el documento existe, verificamos si el C_digo ya está presente
        const existingOT = document.data && document.data.find(subObject => subObject.C_digo === C_digo);

        if (existingOT) {
            console.log('El objeto con C_digo ya existe, no se crea nada.');
            return false;  // Si el objeto ya existe, no lo agregamos
        }

        // Si no existe el C_digo, lo agregamos
        console.log('C_digo no encontrado, agregando el nuevo objeto...');
        document.data.push(...body.data);  // Agregamos directamente el objeto al array de 'data'

        // Actualizamos el documento con el nuevo objeto
        const result = await collection.updateOne(
            { _id: document._id },
            { $set: { data: document.data } }  // Actualizamos el campo 'data'
        );
        console.log('Documento actualizado con el nuevo objeto:', result);
        return body.data;  // Retornamos el objeto recién agregado

    } catch (error) {
        console.error('Error al verificar y crear el documento:', error);
        throw error;  // Lanza el error, pero de forma controlada
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
