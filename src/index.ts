import { config } from "./config.js";
import { PlaywrightScraper } from "./scraper.js";
import { MongoDb, MongoLinkRepository } from "./db.js";
import { main } from "./main.js";

const db = await MongoDb.create(config.mongoDb.url);
const linkRepository = await MongoLinkRepository.create(db);
const scraper = await PlaywrightScraper.create(config.scraper);

await main(100, scraper, linkRepository);

await db.close();
await scraper.close();
