export interface LinkDocument {
  link: string;
  type: "list" | "game";
  data?: Record<string, unknown>;
  visitedAt: Date | null;
}

export type WithId<T> = T & { id: string };

export interface UpdateByIdOperation {
  id: string;
  document: Partial<LinkDocument>;
}

export interface LinkRepository {
  insertLinksIfNotExists(documents: LinkDocument[]): Promise<void>;
  findNonVisitedLinks(
    type: LinkDocument["type"],
  ): Promise<WithId<LinkDocument>[]>;
  updateLinkById(operation: UpdateByIdOperation): Promise<void>;
  insertAndUpdateLinks(
    inserts: LinkDocument[],
    updates: UpdateByIdOperation[],
  ): Promise<void>;
}

export interface Scraper {
  authenticate(): Promise<void>;
  scrapeGamesLinksByListLink(listLink: string): Promise<string[]>;
  scrapeGameDataByGameLink(gameLink: string): Promise<Record<string, unknown>>;
}
