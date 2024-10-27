module.exports = function putHandler(data) {
    return new Promise(async (resolve, reject) => {
        try {
            // Lógica para manejar los datos del cuerpo en PUT
            if (data && data.id) {
                const response = [];
                response[0] = true;
                response[1] = data;
                response[2] = 200;
                resolve(response);
            } else {
                const response = [];
                response[0] = false;
                response[1] = "Datos no válidos en PUT";
                response[2] = 400;
                resolve(response);
            }
        } catch (error) {
            reject(error);
        }
    });
};


