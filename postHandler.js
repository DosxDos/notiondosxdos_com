const { nuevaOt } = require("./insert_page");
module.exports = async function postHandler(data) {
    return new Promise(async (resolve, reject) => {
        try {
            if (data) {
                if (data.hasOwnProperty("crearOt")) {
                    const crearNuevaOt = await nuevaOt(data);
                    const response = [];
                    response[0] = true;
                    response[1] = crearNuevaOt;
                    response[2] = 200;
                    resolve(response);
                } else {
                    const response = [];
                    response[0] = false;
                    response[1] = 'No se ha enviado en el cuerpo de la solicitud la variable crearOt';
                    response[2] = 400;
                    resolve(response);
                }
            } else {
                const response = [];
                response[0] = false;
                response[1] = "Datos no válidos en POST";
                response[2] = 400;
                resolve(response);
            }
        } catch (error) {
            reject(error);
        }
    });
};