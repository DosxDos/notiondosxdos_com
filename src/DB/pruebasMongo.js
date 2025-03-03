import MongoDB from './MongoDB.js';

const mongo = new MongoDB();

async function run() {
  await mongo.connect();

  // Operaciones CRUD:
  await mongo.create('usuarios', { nombre: 'Juan', edad: 30, email: 'dsad'});
  const usuarios = await mongo.read('usuarios', {});
  console.log(usuarios);

  await mongo.update('usuarios', { nombre: 'Juan' }, { edad: 31 });
  //await mongo.delete('usuarios', { nombre: 'Juan' });

  await mongo.close();
}

run().catch(console.error);
