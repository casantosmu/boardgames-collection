import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { config } from "./config.js";
import {
  authenticateScraper,
  scrapeCollection,
  type ScrapeCollectionResult,
} from "./scraper.js";
import { downloadImage, logger } from "./helpers.js";

const saveCollection = async (
  collection: ScrapeCollectionResult[],
  collectionPage: number,
): Promise<void> => {
  await fs.mkdir(config.storage.imagesDir, { recursive: true });
  await fs.mkdir(config.storage.collectionsDir, { recursive: true });

  await Promise.all(
    collection.map(({ gameboard, imageSrc }) =>
      downloadImage(
        imageSrc,
        path.join(config.storage.imagesDir, gameboard.img.name),
      ),
    ),
  );

  const filename = path.join(
    config.storage.collectionsDir,
    `${Date.now()}-${collectionPage}.json`,
  );

  const gameboards = collection.map(({ gameboard }) => gameboard);
  const json = JSON.stringify(gameboards);

  await fs.writeFile(filename, json);
};

const browser = await chromium.launch({
  headless: config.isHeadless,
  slowMo: config.slowdownMilliseconds,
});

try {
  const page = await browser.newPage({
    baseURL: config.baseUrl,
  });

  logger.info("Scraping initiated...");

  await authenticateScraper(page, config.auth);

  for (let collectionPage = 1; collectionPage <= 50; collectionPage++) {
    const collection = await scrapeCollection(page, collectionPage);
    await saveCollection(collection, collectionPage);
  }
} finally {
  await browser.close();
  logger.info("Scraping finished.");
}
