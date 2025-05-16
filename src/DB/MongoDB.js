import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

class MongoDB {
  // Variable estática para almacenar la única instancia de la clase
  static instance = null;
  static mongoIds = [];  // Array de diccionarios para almacenar los identificadores
  static peticion = true;

  constructor() {
    if (MongoDB.instance) {
      return MongoDB.instance; // Si ya existe una instancia, devolvemos esa
    }

    dotenv.config(); // Cargar las variables de entorno desde el archivo .env
    const uri = process.env.MONGO_URI; // URL de conexión a tu base de datos
    this.dbName = process.env.DB_NAME; // Nombre de tu base de datos
    this.client = new MongoClient(uri); // Cliente de MongoDB
    this.db = null; // Inicializar la base de datos como null

    MongoDB.instance = this; // Guardamos esta instancia como la única instancia

    console.log('Nueva instancia de MongoDB creada.');
  }

  // Método para conectar a MongoDB
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

  // Método para crear un documento en MongoDB
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

  // Método para leer documentos desde MongoDB
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

  // Método para actualizar documentos en MongoDB
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

  // Método para eliminar documentos en MongoDB
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

  // Función para actualizar el código en MongoDB
  async _actualizarCodigoMongo(nuevoCodigo) {
    try {
      console.log('Actualizando código en MongoDB');

      // Actualizamos el campo C_digo en MongoDB con el nuevo código de Zoho CRM
      const result = await this.db.collection('ot').updateOne(
        { 'data.C_digo': '00000' }, // Buscamos por el código 00000
        { $set: { 'data.$.C_digo': nuevoCodigo } } // Actualizamos el campo C_digo con el nuevo código
      );

      peticion = true;

      console.log('MongoDB actualizado con el nuevo código:', result);

      // Si se modificó al menos un documento, devuelve true. De lo contrario, false.
      return result.modifiedCount > 0;

    } catch (error) {
      console.error('Error al actualizar el código en MongoDB:', error);
      return false; // Si hay un error, devolvemos false
    }
  }


  async initializeMongoIds() {
    if (!Array.isArray(MongoDB.mongoIds)) {
      MongoDB.mongoIds = [];
    }
  }

  async documentExists(collectionName) {
    return MongoDB.mongoIds.findIndex(doc => doc.collectionName === collectionName);
  }

  async createNewDocument(collectionName, body) {
    const collection = this.db.collection(collectionName);
    let newDocument = { collectionName: collectionName, data: body.data };
    MongoDB.mongoIds.push(newDocument);
    const result = await collection.insertOne(newDocument);
    return result;
  }

  async checkCodigoState(document, C_digo) {
    let existingOT = document.data && document.data.find(subObject => subObject.C_digo === C_digo);
    if (existingOT && existingOT.C_digo === '00000') {
      peticion = false;
    }
    return existingOT;
  }

  async updateDocument(document, collectionName) {
    const result = await this.db.collection(collectionName).updateOne(
      { _id: document._id },
      { $set: { data: document.data } }
    );
    return result;
  }

  async createIfNotExists(collectionName, C_digo, body) {
    try {
        console.log('Verificando si el documento ya existe...');
        
        await this.initializeMongoIds(); // Se llama correctamente con `this`
        const docIndex = await this.documentExists(collectionName); // Se llama correctamente con `this`

        if (docIndex === -1) {
            console.log('Documento no encontrado en mongoIds, creando uno nuevo...');
            return await this.createNewDocument(collectionName, body); // Se llama correctamente con `this`
        }

        let document = MongoDB.mongoIds[docIndex];

        let existingOT = await this.checkCodigoState(document, C_digo);

        while (MongoDB.peticion == false) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }

        if (existingOT) {
            console.log('El objeto con C_digo ya existe, no se crea nada.');
            return false;
        }

        console.log('C_digo no encontrado, agregando el nuevo objeto...');
        document.data.push(...body.data);
        return await this.updateDocument(document, collectionName); // Se llama correctamente con `this`

    } catch (error) {
        console.error('Error al verificar y crear el documento:', error);
        throw error;
    }
}



  // Método para cerrar la conexión a MongoDB
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
