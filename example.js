const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
dotenv.config();
token = process.env.API_KEY;
const notion = new Client({ auth: token });
async function getDatabasePages(databaseId) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(databaseId);
      const response = await notion.databases.query({
        database_id: databaseId,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { getDatabasePages };
