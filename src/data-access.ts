import fs from "node:fs/promises";
import path from "node:path";
import type { Collection, Gameboard } from "./interfaces.js";
import { downloadImage } from "./helpers.js";

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

  const gameboards: Gameboard[] = [];
  await Promise.all(
    collection.map(async ({ gameboard, imageSrc }) => {
      const imageName = `${Date.now()}-${path.basename(imageSrc)}`;
      const imagePath = path.join(storage.imagesDir, imageName);

      await downloadImage(imageSrc, imagePath);

      gameboards.push({
        ...gameboard,
        img: {
          name: imageName,
        },
      });
    }),
  );

  const collectionName = `${Date.now()}-${collectionPage}.json`;
  const collectionPath = path.join(storage.collectionsDir, collectionName);

  const json = JSON.stringify(gameboards);

  await fs.writeFile(collectionPath, json);
};
