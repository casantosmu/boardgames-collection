import fs from "node:fs/promises";
import { chromium } from "playwright";
import { config } from "./config.js";
import { authenticateScraper, saveCollection } from "./scraper.js";

await fs.mkdir(config.storage.imagesDir, { recursive: true });
await fs.mkdir(config.storage.gameboardsDir, { recursive: true });

const browser = await chromium.launch({
  headless: config.isHeadless,
  slowMo: config.slowdownMilliseconds,
});

try {
  const page = await browser.newPage({
    baseURL: config.baseUrl,
  });

  const maxCollectionPages = 2;

  await authenticateScraper(page, config.auth);

  for (
    let collectionPage = 1;
    collectionPage <= maxCollectionPages;
    collectionPage++
  ) {
    await saveCollection(page, collectionPage, config.storage);
  }
} finally {
  await browser.close();
}
