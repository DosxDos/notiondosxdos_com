//shorter
const { Client } = require("@notionhq/client");
require("dotenv").config(); // Load environment variables from .env file
const notion = new Client({ auth: process.env.API_KEY });

async function paginas() {
  try {
    async function queryDatabase(databaseId, startCursor) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
      });
      console.log(response);
      return response;
    }

    async function databaseQueryAll(databaseID) {
      let data = await queryDatabase(databaseID);
      let { results, has_more, next_cursor } = data;
      let allResults = [...results]; // Initialize with the first batch of results

      while (has_more) {
        const dataWhile = await queryDatabase(databaseID, next_cursor);
        allResults = [...allResults, ...dataWhile.results]; // Concatenate using spread operator
        has_more = dataWhile.has_more;
        next_cursor = dataWhile.next_cursor;
        console.log("Retrieved additional results:", dataWhile.results);
      }

      return allResults; // Return the concatenated array
    }

    const databaseId = "6d931cb607c14004ba8de2992fbe94eb";
    const allData = await databaseQueryAll(databaseId);
    console.log("Final results:", allData);
    return allData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { paginas };

/*const { Client } = require("@notionhq/client");
require("dotenv").config(); // Load environment variables from .env file
const notion = new Client({ auth: process.env.API_KEY });
async function paginas() {
  return new Promise(async (resolve, reject) => {
    try {
      async function queryDatabase(databaseId, startCursor) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await notion.databases.query({
              database_id: databaseId,
              start_cursor: startCursor,
            });
            console.log(response);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      }
      async function databaseQueryAll(databaseID) {
        return new Promise(async (resolve, reject) => {
          try {
            let data = await queryDatabase(databaseID);
            let { results, has_more, next_cursor } = data;
            resultados1 = [];
            resultados2 = [];
            resultados1.push(results);
            while (has_more) {
              const dataWhile = await queryDatabase(databaseID, next_cursor);
              resultados2.push(dataWhile.results);
              has_more = dataWhile.has_more;
              next_cursor = dataWhile.next_cursor;
              console.log("Retrieved additional results:", dataWhile.results);
            }
            resultadoTotal = [];
            i = 0;
            resultados1.map((vector) => {
              vector.map((elemento) => {
                resultadoTotal[i] = elemento;
                i++;
              });
            });
            resultados2.map((vector) => {
              vector.map((elemento) => {
                resultadoTotal[i] = elemento;
                i++;
              });
            });
            //resultadoTotal = resultados1.concat(resultados2)
            //console.log("Total results:", results);
            resolve(resultadoTotal);
          } catch (error) {
            reject(error);
          }
        });
      }
      const databaseId = "6d931cb607c14004ba8de2992fbe94eb";
      const allData = await databaseQueryAll(databaseId);
      console.log("Final results:", allData);
      resolve(allData);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { paginas };*/
