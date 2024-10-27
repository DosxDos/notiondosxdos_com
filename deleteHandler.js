module.exports = function deleteHandler(data) {
    return new Promise(async (resolve, reject) => {
        try {
            // Lógica para manejar los datos del cuerpo en DELETE
            if (data && data.id) {
                const response = [];
                response[0] = true;
                response[1] = data;
                response[2] = 200;
                resolve(response);
            } else {
                const response = [];
                response[0] = false;
                response[1] = "Datos no válidos en DELETE";
                response[2] = 400;
                resolve(response);
            }
        } catch (error) {
            reject(error);
        }
    });
};