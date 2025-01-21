import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.API_KEY;
const notion = new Client({auth: apiKey});
async function getDatabasePages(databaseId) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await notion.databases.query({ database_id: databaseId });
            console.log(response);
            resolve(response);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
getDatabasePages('Proyectos-e39bb6b7f8a9479e943e8d74f903645d');