import { createClient } from "contentful";
import * as fs from 'fs';
require('dotenv').config();

type AppImage = {
  // we don't care about `metadata` and `sys` field for now
  fields: {
      title: string;
      description: string;
      file: {
          url: string;
          details: {
              size: number;
              image: {
                  width: number;
                  height: number;
              };
          };
          fileName: string;
          contentType: string;
      };
  };
};

type Badge = {
    title: string;
    color: string;
}

type WayToEarnPoints = {
    link?: string;
    title?: string;
    modePts?: string;
    ownPts?: string;
}

type Entry = {
  // we don't care about `metadata` and `sys` field for now
  fields: {
      name: string;
      id: number;
      logo: AppImage;
      brandColor?: string;
      link: string;
      shortDescription: string;
      badges?: Badge[];
      waysToEarnPoints: WayToEarnPoints;
  };
};

type Order = {
    // we don't care about `metadata` and `sys` field for now
    fields: {
        name: string;
        order: {
            order: Number[];
        }
    };
}

if (!(process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN)) {
    throw new Error("Contentful configuration isn't full")
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_TOKEN,
});

export async function getSortedEcosystemApps(contentType: string) {
    // @ts-ignore
    const order = (await client.getEntries({
        content_type: 'ecosystemOrder',
    })).items[0] as Order;
    // @ts-ignore
    const entries = (await client.getEntries({
        content_type: contentType,
    })) as {items: Entry[]}
    if (entries.items && order) return entries.items.sort((a, b) => {
      return order.fields.order.order.indexOf(a.fields.id) - order.fields.order.order.indexOf(b.fields.id);
  });
};

const fetchEntriesAndWriteToFile = async (contentType: string, fileName: string) => {
    try {
      const entries = await getSortedEcosystemApps(contentType);
      fs.writeFileSync(`${fileName}.json`, JSON.stringify(entries, null, 2));
  
      console.log(`Entries successfully written to ${fileName}.json`);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

fetchEntriesAndWriteToFile('ecosystem', 'content'); // TODO: remove once we fully rely on Apps model
fetchEntriesAndWriteToFile('apps', 'apps');
