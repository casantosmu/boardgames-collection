import fs from "node:fs/promises";
import path from "node:path";
import type { Collection, Gameboard } from "./interfaces.js";
import { downloadImage } from "./helpers.js";

interface Config {
  gameboardsDir: string;
  imagesDir: string;
}

export const saveCollection = async (
  collection: Collection[],
  collectionPage: number,
  config: Config,
): Promise<void> => {
  await fs.mkdir(config.imagesDir, { recursive: true });
  await fs.mkdir(config.gameboardsDir, { recursive: true });

  const gameboards: Gameboard[] = [];
  await Promise.all(
    collection.map(async ({ gameboard, imageSrc }) => {
      const imageName = `${Date.now()}-${path.basename(imageSrc)}`;
      const imagePath = path.join(config.imagesDir, imageName);

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
  const collectionPath = path.join(config.gameboardsDir, collectionName);

  const json = JSON.stringify(gameboards);

  await fs.writeFile(collectionPath, json);
};
