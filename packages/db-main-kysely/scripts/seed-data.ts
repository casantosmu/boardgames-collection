import pg from "pg";
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely";
import type { DB } from "../generated/db.js";
import boardgames from "../../../seeds/boardgames.json";

/** Seed data for development */

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env["DATABASE_URL"],
    }),
  }),
  plugins: [new CamelCasePlugin()],
});

const types = new Set<string>();
const categories = new Set<string>();
const mechanisms = new Set<string>();

for (const boardgame of boardgames) {
  for (const type of boardgame.types) {
    types.add(type);
  }
  for (const category of boardgame.categories) {
    categories.add(category);
  }
  for (const mechanism of boardgame.mechanisms) {
    mechanisms.add(mechanism);
  }
}

await db.transaction().execute(async (trx) => {
  await trx
    .insertInto("types")
    .values(
      Array.from(types).map((type) => ({
        type,
      })),
    )
    .execute();

  await trx
    .insertInto("categories")
    .values(
      Array.from(categories).map((category) => ({
        category,
      })),
    )
    .execute();

  await trx
    .insertInto("mechanisms")
    .values(
      Array.from(mechanisms).map((mechanism) => ({
        mechanism,
      })),
    )
    .execute();

  await trx
    .insertInto("boardgames")
    .values(
      boardgames.map(
        ({
          id,
          rate,
          name,
          yearPublished,
          description,
          shortDescription,
          complexity,
          minAge,
          minPlayers,
          maxPlayers,
          minDuration,
          maxDuration,
        }) => ({
          boardgameId: id,
          rate,
          boardgameName: name,
          yearPublished,
          description,
          shortDescription,
          complexity,
          minAge,
          minPlayers,
          maxPlayers,
          minDuration,
          maxDuration,
        }),
      ),
    )
    .execute();

  const insertAlternateNamesPromise = boardgames.map(async (boardgame) => {
    if (!boardgame.alternateNames) {
      return;
    }

    await trx
      .insertInto("alternateNames")
      .values(
        boardgame.alternateNames.map((alternateName) => ({
          boardgameId: boardgame.id,
          alternateName,
        })),
      )
      .onConflict((oc) => oc.doNothing())
      .execute();
  });

  await Promise.all(insertAlternateNamesPromise);

  const insertBestPlayersPromise = boardgames.map(async (boardgame) => {
    await trx
      .insertInto("bestPlayers")
      .values(
        boardgame.bestPlayers.map((bestPlayers) => ({
          boardgameId: boardgame.id,
          minPlayers: bestPlayers.min,
          maxPlayers: bestPlayers.max,
        })),
      )
      .execute();
  });

  await Promise.all(insertBestPlayersPromise);

  const insertBoardgamesTypesPromise = boardgames.map(async (boardgame) => {
    await trx
      .insertInto("boardgamesTypes")
      .values(
        boardgame.types.map((type) => ({
          boardgameId: boardgame.id,
          type,
        })),
      )
      .execute();
  });

  await Promise.all(insertBoardgamesTypesPromise);

  const insertBoardgamesMechanismsPromise = boardgames.map(
    async (boardgame) => {
      await trx
        .insertInto("boardgamesMechanisms")
        .values(
          boardgame.mechanisms.map((mechanism) => ({
            boardgameId: boardgame.id,
            mechanism,
          })),
        )
        .execute();
    },
  );

  await Promise.all(insertBoardgamesMechanismsPromise);

  const insertBoardgamesCategoriesPromise = boardgames.map(
    async (boardgame) => {
      await trx
        .insertInto("boardgamesCategories")
        .values(
          boardgame.categories.map((category) => ({
            boardgameId: boardgame.id,
            category,
          })),
        )
        .execute();
    },
  );

  await Promise.all(insertBoardgamesCategoriesPromise);
});
