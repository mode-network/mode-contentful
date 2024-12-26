import { createClient } from "contentful";
import * as fs from "fs";
require("dotenv").config();

if (!(process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN)) {
    throw new Error("Contentful configuration isn't full");
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_TOKEN
});

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
    const params = { content_type: contentType, include: 10, limit: 1000 };
    
    try {
        const entries = withAllLocales
            ? await client.withAllLocales.withoutUnresolvableLinks.getEntries(params)
            : await client.getEntries(params);

        writeToFile(entries.items, fileName);
        console.log(`Entries successfully written to ${fileName}.json`);
    } catch (error) {
        console.error(`Error fetching entries. Content type: ${contentType}`, error);
    }
};

fetchEntriesAndWriteToFile({ contentType: "thirdPartyBridge", fileName: "thirdPartyBridges" });
fetchEntriesAndWriteToFile({ contentType: "faqItem", fileName: "faqItemWithAllLocales", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "localizedString", fileName: "localizedStrings", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "news", fileName: "news", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "guides", fileName: "guides", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "seasonalBanners", fileName: "seasonalBanners", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "ecosystemPage", fileName: "ecosystemPage", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "categories", fileName: "categories", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "dappBanner", fileName: "dappBanner", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "aiSections", fileName: "aiSections", withAllLocales: true });
fetchEntriesAndWriteToFile({ contentType: "governanceCalendar", fileName: "governanceCalendar", withAllLocales: true });
