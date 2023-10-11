import { chromium, type Browser, type Page } from "playwright";
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
  }

  async scrapeGamesLinksByListLink(listLink: string): Promise<string[]> {
    await this.page.goto(listLink);
    const element = await this.page.locator(".collection_objectname a").all();
    return Promise.all(
      element.map(async (element) => {
        const href = await element.getAttribute("href");
        const text = await element.textContent();
        if (!href) {
          throw new Error(`Missing href attribute in ${text}`);
        }
        return href;
      }),
    );
  }

  async scrapeGameDataByGameLink(gameLink: string): Promise<unknown> {
    await this.page.goto(gameLink);
    return this.page.evaluate("GEEK.geekitemPreload.item");
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
