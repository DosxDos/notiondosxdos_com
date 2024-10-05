const { Client } = require("@notionhq/client");
const moment = require('moment');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Notion client
const notion = new Client({ auth: process.env.API_KEY });

// Load database ID from environment variables
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

const propertiesToCheck = [
    { id: process.env.PREFIJO_ID, type: 'rich_text' },
    { id: process.env.NUMERO_ID, type: 'title' },
    { id: process.env.NAVISION_ID, type: 'rich_text' },
    { id: process.env.NOMBRE_ID, type: 'rich_text' },
    { id: process.env.CLIENTE_ID, type: 'rich_text' },
    { id: process.env.FIRMA_ID, type: 'rich_text' },
    { id: process.env.FECHA_DE_MONTAJE_ID, type: 'date' },
    { id: process.env.DEPARTAMENTO_RELACIONADO_ID, type: 'multi_select' },
    { id: process.env.PHOTOAPP_ID, type: 'url' },
    { id: process.env.TIPO_DE_OT_ID, type: 'rich_text' },
    { id: process.env.SUBTIPO_ID, type: 'rich_text' },
    { id: process.env.CRM_ID, type: 'rich_text' },
];

const createFilterForProperties = (properties, since) => {
    return {
        and: [
            {
                property: 'Última edición',
                date: {
                    after: since
                }
            },
            /*{
                or: properties.map(property => {
                    const filter = {
                        property: property.id,
                    };
                    switch (property.type) {
                        case 'title':
                            filter.title = {
                                is_not_empty: true,
                            };
                            break;
                        case 'rich_text':
                            filter.rich_text = {
                                is_not_empty: true,
                            };
                            break;
                        case 'date':
                            filter.date = {
                                is_not_empty: true,
                            };
                            break;
                        case 'multi_select':
                            filter.multi_select = {
                                is_not_empty: true,
                            };
                            break;
                        case 'url':
                            filter.url = {
                                is_not_empty: true,
                            };
                            break;
                        default:
                            break;
                    }
                    return filter;
                })
            }*/
        ]
    };
};

// FETCHING RECORDS FROM NOTION, MODIFIED SINCE A SPECIFIED TIME (3 MINUTES)
async function fetchNotionRecords(since) {
    try {
        const filters = createFilterForProperties(propertiesToCheck, since);
        const response = await notion.databases.query({
            database_id: notionDatabaseId,
            filter: filters,
        });
        return response.results; // Return fetched records
    } catch (error) {
        console.error('Error fetching records from Notion:', error); // Log any errors
        return [];
    }
}

// FETCH ALL PROPERTIES OF SPECIFIED RECORDS
async function fetchAllPropertiesOfRecords(recordIds) {
    const records = [];
    for (const recordId of recordIds) {
        try {
            const response = await notion.pages.retrieve({ page_id: recordId });
            records.push(response);
        } catch (error) {
            console.error(`Error fetching record ${recordId}:`, error);
        }
    }
    return records;
}

// SYNCHRONIZING RECORDS BETWEEN NOTION AND CRM
async function synchronizeRecords() {
    const now = moment().toISOString();
    const threeMinutesAgo = moment().subtract(3, 'minutes').toISOString();

    console.log(`Fetching records from Notion modified since ${threeMinutesAgo}...`);
    const notionRecords = await fetchNotionRecords(threeMinutesAgo);
    if (!notionRecords.length) {
        console.log('No records found in Notion.');
        return;
    }
    console.log(`Found ${notionRecords.length} records in Notion.`);

    const recordIds = notionRecords.map(record => record.id);
    const detailedRecords = await fetchAllPropertiesOfRecords(recordIds);

    for (const record of detailedRecords) {
        console.log(`Notion Record ID: ${record.id}`);
        console.log('Properties:');
        for (const [key, value] of Object.entries(record.properties)) {
            console.log(`${key}: ${JSON.stringify(value)}`);
        }
        console.log('------------------------------------------------');
    }
}

// Run the synchronization every 3 minutes
setInterval(synchronizeRecords, 3 * 60 * 1000); // 3 minutes in milliseconds

// Initial run
synchronizeRecords().catch(console.error); // Catch and log any errors
