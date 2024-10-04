import { createClient } from "contentful";
import * as fs from "fs";
require("dotenv").config();

const baseLocale = "en-US";

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
};

type WayToEarnPoints = {
    link?: string;
    title?: string;
    shortDescription?: string;
    modePts?: string;
    ownPts?: string;
};

type App = {
    // we don't care about `metadata` and `sys` field for now
    fields: {
        name: string;
        id: Record<string, number>;
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
        };
    };
};

if (!(process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN)) {
    throw new Error("Contentful configuration isn't full");
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_TOKEN
});

async function getSortedEcosystemAppsWithLocales(contentType: string) {
    // @ts-ignore
    const order = (
        await client.getEntries({
            content_type: "ecosystemOrder"
        })
    ).items[0] as Order;
    // @ts-ignore
    const entries = (await client.withAllLocales.getEntries({
        content_type: contentType
    })) as { items: App[] };
    if (entries.items && order)
        return entries.items.sort((a, b) => {
            return (
                order.fields.order.order.indexOf(a.fields.id[baseLocale]) -
                order.fields.order.order.indexOf(b.fields.id[baseLocale])
            );
        });
}

const writeToFile = (data: unknown, fileName: string) => {
    fs.writeFileSync(`${fileName}.json`, JSON.stringify(data, null, 2));
};

const fetchEntriesAndWriteToFile = async ({
    contentType,
    fileName,
    withAllLocales
}: {
    contentType: string;
    fileName: string;
    withAllLocales?: boolean;
}) => {
    try {
        if (contentType === "apps") {
            const sortedApps = await getSortedEcosystemAppsWithLocales(contentType);
            writeToFile(sortedApps, fileName);
        } else {
            const entries = withAllLocales
                ? await client.withAllLocales.getEntries({ content_type: contentType })
                : await client.getEntries({ content_type: contentType });

            writeToFile(entries.items, fileName);
        }
        console.log(`Entries successfully written to ${fileName}.json`);
    } catch (error) {
        console.error("Error fetching entries:", error);
    }
};

fetchEntriesAndWriteToFile({ contentType: "asset", fileName: "assets" });
fetchEntriesAndWriteToFile({ contentType: "apps", fileName: "appsWithAllLocales", withAllLocales: true });
fetchEntriesAndWriteToFile({
    contentType: "restakingBanner",
    fileName: "restakingBannersWithAllLocales",
    withAllLocales: true
});
fetchEntriesAndWriteToFile({ contentType: "thirdPartyBridge", fileName: "thirdPartyBridges" });
fetchEntriesAndWriteToFile({ contentType: "points", fileName: "points" });
fetchEntriesAndWriteToFile({ contentType: "faqItem", fileName: "faqItemWithAllLocales", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "localizedString", fileName: "localizedStrings", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "news", fileName: "news", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "guides", fileName: "guides", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "seasonalBanners", fileName: "seasonalBanners", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "ecosystem", fileName: "ecosystem", withAllLocales: true });
