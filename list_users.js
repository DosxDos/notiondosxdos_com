const { Client } = require('@notionhq/client');
require("dotenv").config(); 
const notion = new Client({ auth: process.env.API_KEY });

(async () => {
  const response = await notion.users.list();
  console.log(response);
})();