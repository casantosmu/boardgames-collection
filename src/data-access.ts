import fs from "node:fs/promises";
import path from "node:path";
import type { Gameboard } from "./interfaces.js";
import { downloadImage } from "./helpers.js";

interface Collection {
  gameboard: Gameboard;
  imageSrc: string;
}

interface Storage {
  collectionsDir: string;
  imagesDir: string;
}

export const saveCollection = async (
  collection: Collection[],
  collectionPage: number,
  storage: Storage,
): Promise<void> => {
  await fs.mkdir(storage.imagesDir, { recursive: true });
  await fs.mkdir(storage.collectionsDir, { recursive: true });

  await Promise.all(
    collection.map(({ gameboard, imageSrc }) =>
      downloadImage(imageSrc, path.join(storage.imagesDir, gameboard.img.name)),
    ),
  );

  const filename = path.join(
    storage.collectionsDir,
    `${Date.now()}-${collectionPage}.json`,
  );

  const gameboards = collection.map(({ gameboard }) => gameboard);
  const json = JSON.stringify(gameboards);

  await fs.writeFile(filename, json);
};
