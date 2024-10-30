const { Client } = require("@notionhq/client");
require("dotenv").config();


(async () => {
    const notion = new Client({ auth: process.env.API_KEY });
  try {
    const response = await notion.users.list();
    for (const user of response.results) {
      if (user.type === 'person') {
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.person.email}`); // Now includes email
      }
    }
  } catch (error) {
    console.error(error);
  }
})();