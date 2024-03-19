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
    shortDescription?: string;
    modePts?: string;
    ownPts?: string;
}

type App = {
  // we don't care about `metadata` and `sys` field for now
  fields: {
      name: string;
      id: number;
      logo: AppImage;
      brandColor?: string;
      link: string;
      shortDescription: string;
      isPending?: boolean;
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

type ContentType = "asset" | "apps" | "restakingBanner" | "UILocalization";

if (!(process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN)) {
    throw new Error("Contentful configuration isn't full")
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_TOKEN,
});

async function getSortedEcosystemApps(contentType: string) {
    // @ts-ignore
    const order = (await client.getEntries({
        content_type: 'ecosystemOrder',
    })).items[0] as Order;
    // @ts-ignore
    const entries = (await client.getEntries({
        content_type: contentType,
    })) as {items: App[]}
    if (entries.items && order) return entries.items.sort((a, b) => {
      return order.fields.order.order.indexOf(a.fields.id) - order.fields.order.order.indexOf(b.fields.id);
  });
};

const writeToFile = (data: unknown, fileName: string) => {
    fs.writeFileSync(`${fileName}.json`, JSON.stringify(data, null, 2));
}

const fetchEntriesAndWriteToFile = async ({
      contentType,
      fileName,
      withAllLocales,
  }: {
      contentType: ContentType,
      fileName: string,
      withAllLocales?: boolean,
  }) => {
    try {
      if (contentType === "apps") {
        const sortedApps = await getSortedEcosystemApps(contentType);

        writeToFile(sortedApps, fileName);
      } else {
        const entries = withAllLocales ?
        await client.withAllLocales.getEntries({ content_type: contentType }) :
        await client.getEntries({ content_type: contentType });
  
        writeToFile(entries.items, fileName);
      }  
      console.log(`Entries successfully written to ${fileName}.json`);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

fetchEntriesAndWriteToFile({ contentType: 'asset', fileName: 'assets' });
fetchEntriesAndWriteToFile({ contentType: 'apps', fileName: 'apps' });
fetchEntriesAndWriteToFile({ contentType: 'restakingBanner', fileName: 'restakingBanners' });
fetchEntriesAndWriteToFile({ contentType: 'UILocalization', fileName: 'UILocalization', withAllLocales: true });
