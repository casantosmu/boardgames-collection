import pg from "pg";
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely";
import type { DB } from "../generated/db.js";
import boardgames from "../seeds/boardgames.json";

/** Seed data for development */

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env["DATABASE_URL"],
    }),
  }),
  plugins: [new CamelCasePlugin()],
});

try {
  await db.transaction().execute(async (trx) => {
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
      .onConflict((oc) => oc.doNothing())
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
        .onConflict((oc) => oc.doNothing())
        .execute();
    });

    await Promise.all(insertBestPlayersPromise);

    const insertTypesPromise = boardgames.map(async (boardgame) => {
      await trx
        .insertInto("types")
        .values(
          boardgame.types.map((type) => ({
            type,
          })),
        )
        .onConflict((oc) => oc.doNothing())
        .execute();
    });

    await Promise.all(insertTypesPromise);

    const insertBoardgamesTypesPromise = boardgames.map(async (boardgame) => {
      await trx
        .insertInto("boardgamesTypes")
        .values(
          boardgame.types.map((type) => ({
            boardgameId: boardgame.id,
            type,
          })),
        )
        .onConflict((oc) => oc.doNothing())
        .execute();
    });

    await Promise.all(insertBoardgamesTypesPromise);

    const insertMechanismsPromise = boardgames.map(async (boardgame) => {
      await trx
        .insertInto("mechanisms")
        .values(
          boardgame.mechanisms.map((mechanism) => ({
            mechanism,
          })),
        )
        .onConflict((oc) => oc.doNothing())
        .execute();
    });

    await Promise.all(insertMechanismsPromise);

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
          .onConflict((oc) => oc.doNothing())
          .execute();
      },
    );

    await Promise.all(insertBoardgamesMechanismsPromise);

    const insertCategoriesPromise = boardgames.map(async (boardgame) => {
      await trx
        .insertInto("categories")
        .values(
          boardgame.categories.map((category) => ({
            category,
          })),
        )
        .onConflict((oc) => oc.doNothing())
        .execute();
    });

    await Promise.all(insertCategoriesPromise);

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
          .onConflict((oc) => oc.doNothing())
          .execute();
      },
    );

    await Promise.all(insertBoardgamesCategoriesPromise);
  });

  console.log(`Seed was executed successfully`);

  await db.destroy();
} catch (error) {
  console.error("Failed to seed");
  console.error(error);
  process.exit(1);
}
