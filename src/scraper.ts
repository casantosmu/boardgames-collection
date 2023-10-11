import { chromium, type Browser, type Page } from "playwright";
import { z } from "zod";
import type { Scraper } from "./domain.js";

interface Auth {
  username: string;
  password: string;
}

interface Config {
  baseUrl: string;
  auth: Auth;
  isHeadless: boolean;
  slowdownMilliseconds: number;
}

const gameDataSchema = z.record(z.string(), z.unknown());

export class PlaywrightScraper implements Scraper {
  private constructor(
    private readonly browser: Browser,
    private readonly page: Page,
    private readonly config: Config,
  ) {}

  static async create(config: Config): Promise<PlaywrightScraper> {
    const browser = await chromium.launch({
      headless: config.isHeadless,
      slowMo: config.slowdownMilliseconds,
    });

    const page = await browser.newPage({
      baseURL: config.baseUrl,
    });

    return new PlaywrightScraper(browser, page, config);
  }

  async authenticate(): Promise<void> {
    await this.page.goto("/");
    await this.page.getByText("Sign In").click();
    await this.page
      .getByPlaceholder("Username")
      .fill(this.config.auth.username);
    await this.page
      .getByPlaceholder("Password")
      .fill(this.config.auth.password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
    await this.page.getByPlaceholder("Username").waitFor({ state: "hidden" });
    console.log("Authentication successful");
  }

  async scrapeGamesLinksByListLink(listLink: string): Promise<string[]> {
    try {
      await this.page.goto(listLink);
      const elements = await this.page
        .locator(".collection_objectname a")
        .all();
      if (!elements.length) {
        throw new Error("Anchor elements not found");
      }
      return await Promise.all(
        elements.map(async (element) => {
          const href = await element.getAttribute("href");
          const text = await element.textContent();
          if (!href) {
            throw new Error(`Missing href attribute in "${text}"`);
          }
          return href;
        }),
      );
    } catch (err) {
      const error = new Error(`Error while scraping ${listLink}`);
      error.cause = err;
      throw error;
    }
  }

  async scrapeGameDataByGameLink(
    gameLink: string,
  ): Promise<Record<string, unknown>> {
    try {
      await this.page.goto(gameLink);
      const data = await this.page.evaluate("GEEK.geekitemPreload.item");
      const validation = gameDataSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(`Invalid game data: ${validation.error.message}`);
      }
      return validation.data;
    } catch (err) {
      const error = new Error(`Error while scraping ${gameLink}`);
      error.cause = err;
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
