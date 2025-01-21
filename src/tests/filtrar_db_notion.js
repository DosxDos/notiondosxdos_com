import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const ApiKey = process.env.API_KEY;

// Initialize Notion client
const notion = new Client({ auth: ApiKey });

// Load database ID from environment variables
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const crmIdProperty = process.env.CRM_ID; // The name of the CRM ID property in Notion

// Function to get a Notion record based on CRM ID
const getNotionRecordByCrmId = async (crmId) => {
    try {
        // Query the Notion database to find the record with the specified CRM ID
        const response = await notion.databases.query({
            database_id: notionDatabaseId,
            filter: {
                property: crmIdProperty,
                rich_text: {
                    equals: crmId,
                },
            },
        });

        if (response.results.length === 0) {
            console.log(`No record found for CRM ID: ${crmId}`);
            return null;
        }

        // Assuming the CRM ID is unique and we get exactly one result
        const record = response.results[0];
        const recordId = record.id;

        // Retrieve the full details of the record
        const detailedRecord = await notion.pages.retrieve({ page_id: recordId });
        return detailedRecord;
    } catch (error) {
        console.error('Error fetching record from Notion:', error);
        return null;
    }
};

// Example usage
(async () => {
    const crmId = '707987000010430317'; // Replace with the actual CRM ID you want to search for
    const notionRecord = await getNotionRecordByCrmId(crmId);
    if (notionRecord) {
        console.log(`Record found for CRM ID: ${crmId}`);
        console.log(JSON.stringify(notionRecord, null, 2));
    }
})();
