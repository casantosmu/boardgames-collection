import path from "node:path";
import type { Page } from "playwright";
import type { Gameboard } from "./interfaces.js";
import {
  coerceIntNumber,
  coerceNumber,
  parseIdFromUrl,
  parsePlayers,
  parseDuration,
  logger,
} from "./helpers.js";

export const authenticateScraper = async (
  page: Page,
  auth: { username: string; password: string },
): Promise<void> => {
  await page.goto("/");
  await page.getByText("Sign In").click();
  await page.getByPlaceholder("Username").fill(auth.username);
  await page.getByPlaceholder("Password").fill(auth.password);
  await page.getByRole("button", { name: "Sign In" }).click();
};

const getGameboardsUrlsFromCollection = async (
  page: Page,
  collectionPage: number,
): Promise<string[]> => {
  await page.goto("/");
  const baseUrl = page.url();

  await page.goto(`/browse/boardgame/page/${collectionPage}`);

  const collection = await page.locator(".collection_objectname").all();

  const urlsPromises = collection.map(async (rowElement) => {
    const linkElement = rowElement.locator("a");
    const text = await linkElement.textContent();
    const url = await linkElement.getAttribute("href");

    if (!url) {
      throw new Error(`href not found for ${text}`);
    }

    return url.replaceAll(baseUrl, "");
  });

  return Promise.all(urlsPromises);
};

const getGameboardData = async (
  page: Page,
  gameboardUrl: string,
): Promise<Omit<Gameboard, "img">> => {
  await page.goto(gameboardUrl);

  const gameId = parseIdFromUrl(gameboardUrl);

  if (!gameId.success) {
    throw new Error(`Invalid game ID for game: '${gameboardUrl}'`);
  }

  // Game details
  const rank = coerceNumber(
    await page.locator(".rank-number").first().textContent(),
  );

  if (!rank.success) {
    throw new Error(`Invalid rank for game: '${gameboardUrl}'`);
  }

  const players = parsePlayers(
    await page.locator(".gameplay-item-primary span").first().textContent(),
  );

  if (!players.success) {
    throw new Error(`Invalid players for game: '${gameboardUrl}'`);
  }

  const communityPlayers = parsePlayers(
    await page.locator(".gameplay-item-secondary span").nth(2).textContent(),
  );

  if (!communityPlayers.success) {
    throw new Error(`Invalid community players for game: '${gameboardUrl}'`);
  }

  const bestPlayers = parsePlayers(
    (
      await page.locator(".gameplay-item-secondary span").nth(3).textContent()
    )?.replaceAll("— 								Best:", ""),
  );

  if (!bestPlayers.success) {
    throw new Error(`Invalid best players for game: '${gameboardUrl}'`);
  }

  const duration = parseDuration(
    await page
      .locator(".gameplay-item-primary")
      .nth(1)
      .locator("span span")
      .first()
      .textContent(),
  );

  if (!duration.success) {
    throw new Error(`Invalid duration for game: '${gameboardUrl}'`);
  }

  const types = await Promise.all(
    (
      await page
        .locator(".feature")
        .filter({ hasText: "Type" })
        .first()
        .locator(".feature-description a")
        .all()
    ).map(async (type) => {
      const name = await type.textContent();

      if (!name) {
        throw new Error(`Type name not found for game: '${gameboardUrl}'`);
      }

      const href = await type.getAttribute("href");
      const id = parseIdFromUrl(href);

      if (!id.success) {
        throw new Error(`Invalid type id for game: '${gameboardUrl}'`);
      }

      return {
        id: id.data,
        name,
      };
    }),
  );

  const longDescription = await page
    .locator(".game-description-body")
    .textContent();

  if (!longDescription) {
    throw new Error(`Long description not found for game: '${gameboardUrl}'`);
  }

  const shortDescription = await page
    .locator(".game-header-title-info p")
    .textContent();

  if (!shortDescription) {
    throw new Error(`Short description not found for game: '${gameboardUrl}'`);
  }

  await page.goto(`${gameboardUrl}/credits`);

  const creditsElements = page
    .locator(".panel")
    .filter({ hasText: "Full Credits" })
    .locator("li");

  const gameName = await creditsElements
    .filter({ hasText: "Primary Name" })
    .locator(".outline-item-description")
    .textContent();

  if (!gameName) {
    throw new Error(`Name not found for game: '${gameboardUrl}'`);
  }

  const gameNames = (
    await creditsElements
      .filter({ hasText: "Alternate Names" })
      .first()
      .locator(".outline-item-description div div")
      .allTextContents()
  ).slice(1);

  const year = coerceIntNumber(
    await creditsElements
      .filter({ hasText: "Year Released" })
      .locator(".outline-item-description")
      .textContent(),
  );

  if (!year.success) {
    throw new Error(`Invalid year for game: '${gameboardUrl}'`);
  }

  const categories = await Promise.all(
    (
      await creditsElements
        .filter({ hasText: /Categories|Category/ })
        .first()
        .locator(".outline-item-description a")
        .all()
    ).map(async (category) => {
      const name = await category.textContent();

      if (!name) {
        throw new Error(`Category name not found for game: '${gameboardUrl}'`);
      }

      const href = await category.getAttribute("href");
      const id = parseIdFromUrl(href);

      if (!id.success) {
        throw new Error(`Invalid category id for game: '${gameboardUrl}'`);
      }

      return {
        id: id.data,
        name,
      };
    }),
  );

  const mechanisms = await Promise.all(
    (
      await creditsElements
        .filter({ hasText: "Mechanisms" })
        .first()
        .locator(".outline-item-description a")
        .all()
    ).map(async (mechanism) => {
      const name = await mechanism.textContent();

      if (!name) {
        throw new Error(`Mechanism name not found for game: '${gameboardUrl}'`);
      }

      const href = await mechanism.getAttribute("href");
      const id = parseIdFromUrl(href);

      if (!id.success) {
        throw new Error(`Invalid mechanism id for game: '${gameboardUrl}'`);
      }

      return {
        id: id.data,
        name,
      };
    }),
  );

  // Get game stats
  await page.goto(`${gameboardUrl}/stats`);

  const gameStatsElements = page.locator(".game-stats li");

  const avgRating = coerceNumber(
    await gameStatsElements
      .filter({ hasText: "Avg. Rating" })
      .locator("a")
      .textContent(),
  );

  if (!avgRating.success) {
    throw new Error(`Invalid average rating for game: '${gameboardUrl}'`);
  }

  const ratingsCount = coerceNumber(
    (
      await gameStatsElements
        .filter({ hasText: "No. of Ratings" })
        .locator("a")
        .textContent()
    )?.replaceAll(",", "."),
  );

  if (!ratingsCount.success) {
    throw new Error(`Invalid ratings count for game: '${gameboardUrl}'`);
  }

  const complexity = coerceNumber(
    (
      await gameStatsElements
        .filter({ hasText: "Weight" })
        .locator("a")
        .textContent()
    )?.split("/", 1)[0],
  );

  if (!complexity.success) {
    throw new Error(`Invalid complexity for game: '${gameboardUrl}'`);
  }

  return {
    id: gameId.data,
    name: gameName.trim(),
    names: gameNames.map((name) => name.trim()),
    url: gameboardUrl,
    rank: rank.data,
    year: year.data,
    description: {
      long: longDescription.trim(),
      short: shortDescription.trim(),
    },
    rating: {
      avg: avgRating.data,
      count: ratingsCount.data,
    },
    players: {
      official: {
        players: players.data.players,
        more: players.data.more,
      },
      community: {
        players: communityPlayers.data.players,
        more: communityPlayers.data.more,
      },
      best: {
        players: bestPlayers.data.players,
        more: bestPlayers.data.more,
      },
    },
    duration: {
      min: duration.data[0],
      max: duration.data[1],
    },
    complexity: complexity.data,
    types: types.map((type) => ({
      id: type.id,
      name: type.name.trim(),
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name.trim(),
    })),
    mechanisms: mechanisms.map((mechanism) => ({
      id: mechanism.id,
      name: mechanism.name.trim(),
    })),
  };
};

const getGameboardImageSrc = async (
  page: Page,
  gameboardUrl: string,
): Promise<string> => {
  await page.goto(gameboardUrl);
  await page.locator(".game-header-image a").first().click();
  await page.locator(".image-nav").click();
  await page.locator(".img-modal-img").click();

  const src = await page.locator(".img-modal-img").getAttribute("src");

  if (!src) {
    throw new Error(`Image source not found for game: '${gameboardUrl}'`);
  }

  return src;
};

export interface ScrapeCollectionResult {
  gameboard: Gameboard;
  imageSrc: string;
}

export const scrapeCollection = async (
  page: Page,
  collectionPage: number,
): Promise<ScrapeCollectionResult[]> => {
  const results: ScrapeCollectionResult[] = [];

  const gameboardsUrls = await getGameboardsUrlsFromCollection(
    page,
    collectionPage,
  );

  for (const gameboardUrl of gameboardsUrls) {
    logger.debug(gameboardUrl);

    const gameboardData = await getGameboardData(page, gameboardUrl);
    const imageSrc = await getGameboardImageSrc(page, gameboardUrl);

    const imageFileName = `${Date.now()}-${path.basename(imageSrc)}`;

    const gameboard = {
      ...gameboardData,
      img: {
        name: imageFileName,
      },
    };

    const result: ScrapeCollectionResult = {
      gameboard,
      imageSrc,
    };

    results.push(result);
    logger.debug(result);
  }

  return results;
};
