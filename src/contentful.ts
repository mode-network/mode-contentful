import { createClient } from "contentful";
import * as fs from 'fs';
require('dotenv').config();

if (!(process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN)) {
    throw new Error("Contentful configuration isn't full")
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_TOKEN,
});

export async function getEcosystemApps() {
    const entries = await client.getEntries({
        content_type: 'ecosystem',
    });
    if (entries.items) return entries.items;
};

const fetchEntriesAndWriteToFile = async () => {
    try {
      const entries = await getEcosystemApps();
      fs.writeFileSync('content.json', JSON.stringify(entries, null, 2));
  
      console.log('Entries successfully written to content.json');
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

fetchEntriesAndWriteToFile();
