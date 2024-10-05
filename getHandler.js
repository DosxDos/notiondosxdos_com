const { getDatabasePages } = require("./example");
const { paginas } = require("./pages_db");
module.exports = function getHandler(queryParams) {
  return new Promise(async (resolve, reject) => {
    try {
      if (Object.keys(queryParams).length > 0) {
        if (queryParams.hasOwnProperty("ots")) {
          const pages = await paginas();
          const response = [];
          response[0] = true;
          response[1] = pages;
          response[2] = 200;
          resolve(response);
        } else {
          const response = [];
          response[0] = false;
          response[1] =
            "No hay variables o parámetros válidos en el link que ha llamado a la API";
          response[2] = 400;
          resolve(response);
        }
      } else {
        const response = [];
        response[0] = false;
        response[1] =
          "No hay variables o parámetros en el link que ha llamado a la API";
        response[2] = 404;
        resolve(response);
      }
    } catch (error) {
      reject(error);
    }
  });
};
