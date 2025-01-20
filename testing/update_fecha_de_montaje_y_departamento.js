//This code correctly updates two fields in the CRM(action) from Notion(trigger) 

const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.API_KEY });

const crmUpdateUrl = "https://dosxdos.app.iidos.com/apirest/crm.php";
const crmUpdateOptions = {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
};

const getOtsUrl = "https://notiondosxdos.com/api?ots";

async function updateCrm(data) {
  try {
    const response = await fetch(crmUpdateUrl, {
      ...crmUpdateOptions,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`CRM update failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Error updating CRM: ${error.message}`);
  }
}

async function getOts() {
  try {
    const response = await fetch(getOtsUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch OTs: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Error fetching OTs: ${error.message}`);
  }
}

// Function to update multiple records with rate limiting
async function updateCrmBatches(crmData) {
  // Define the maximum number of updates per batch (adjust based on API limits)
  const batchSize = 10;

  for (let i = 0; i < crmData.length; i += batchSize) {
    const batch = crmData.slice(i, i + batchSize);

    // Make multiple update calls with a delay between each batch
    await Promise.all(batch.map(async (data) => await updateCrm(data)));

    // Optional: Introduce a delay between batches (adjust based on API limits)
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  }
}

async function main() {
  try {
    const ots = await getOts();

    const crmData = ots[1].map((page) => {
      // Check if ID_CRM property exists and has a text value
      if (page.properties && page.properties.ID_CRM && page.properties.ID_CRM.rich_text[0]) {
        return {
          actualizarOt: 1,
          crmId: page.properties.ID_CRM.rich_text[0]["text"].content,
          montaje: page.properties.Fecha_de_montaje.date.start,
          Departamentos_relacionados: page.properties.Departamentos_relacionados.multi_select.map(
            (department) => department.name
          ),
        };
      } else {
        // Handle missing data (e.g., log a warning or skip the page)
        console.warn("Skipping page due to missing ID_CRM property");
        return null; // Or any other value to indicate skipping
      }
    });

    // Filter out null values from crmData
    const filteredCrmData = crmData.filter(Boolean);

    await updateCrmBatches(filteredCrmData);

    console.log("All OT updates completed");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the main function
main();