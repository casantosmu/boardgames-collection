import { chromium } from "playwright";
import { config } from "./config.js";
import { saveCollection } from "./data-access.js";
import { authenticateScraper, scrapeCollection } from "./scraper.js";
import { logger } from "./helpers.js";

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
    await saveCollection(collection, collectionPage, config.storage);
  }
} finally {
  await browser.close();
  logger.info("Scraping finished.");
}
