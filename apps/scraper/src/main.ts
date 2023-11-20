import type {
  LinkDocument,
  LinkRepository,
  Scraper,
  UpdateByIdOperation,
} from "./domain.js";

export const main = async (
  maxListsToScrape: number,
  scraper: Scraper,
  linkRepository: LinkRepository,
): Promise<void> => {
  console.log("Starting scraper process...");

  await scraper.authenticate();

  const listsToScrape: LinkDocument[] = [];
  for (let page = 1; page <= maxListsToScrape; page++) {
    const link = `/browse/boardgame/page/${page}`;
    listsToScrape.push({
      link,
      type: "list",
      visitedAt: null,
    });
  }

  await linkRepository.insertLinksIfNotExists(listsToScrape);

  const nonVisitedLists = await linkRepository.findNonVisitedLinks("list");

  for (const list of nonVisitedLists) {
    console.log(`Scraping boardgame list: ${list.link}`);

    const gamesLinks = await scraper.scrapeGamesLinksByListLink(list.link);

    const newGamesLinks: LinkDocument[] = gamesLinks.map((link) => ({
      link,
      type: "game",
      visitedAt: null,
    }));
    const updateListToVisited: UpdateByIdOperation[] = [
      {
        id: list.id,
        document: {
          visitedAt: new Date(),
        },
      },
    ];
    await linkRepository.insertAndUpdateLinks(
      newGamesLinks,
      updateListToVisited,
    );

    console.log(`Finished scraping boardgame list: ${list.link}`);
  }

  const nonVisitedGames = await linkRepository.findNonVisitedLinks("game");

  for (const game of nonVisitedGames) {
    console.log(`Scraping boardgame link: ${game.link}`);

    const data = await scraper.scrapeGameDataByGameLink(game.link);

    await linkRepository.updateLinkById({
      id: game.id,
      document: {
        data,
        visitedAt: new Date(),
      },
    });

    console.log(`Finished scraping boardgame link: ${game.link}`);
  }

  console.log("Scraping process finished");
};
