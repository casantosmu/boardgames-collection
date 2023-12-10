import pg from "pg";
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely";
import type { DB } from "../generated/db.js";
import boardgames from "../seeds/boardgames.json";

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

    await Promise.all(
      boardgames.map(async (boardgame) => {
        if (!boardgame.alternateNames) {
          return;
        }

        await trx
          .insertInto("alternateNames")
          .values(
            boardgame.alternateNames.map((alternateName) => ({
              alternateNameId: alternateName.id,
              alternateName: alternateName.name,
              boardgameId: boardgame.id,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
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
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("types")
          .values(
            boardgame.types.map((type) => ({
              typeId: type.id,
              typeName: type.name,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("boardgamesTypes")
          .values(
            boardgame.types.map((type) => ({
              boardgameId: boardgame.id,
              typeId: type.id,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("mechanisms")
          .values(
            boardgame.mechanisms.map((mechanism) => ({
              mechanismId: mechanism.id,
              mechanismName: mechanism.name,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("boardgamesMechanisms")
          .values(
            boardgame.mechanisms.map((mechanism) => ({
              boardgameId: boardgame.id,
              mechanismId: mechanism.id,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("categories")
          .values(
            boardgame.categories.map((category) => ({
              categoryId: category.id,
              categoryName: category.name,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );

    await Promise.all(
      boardgames.map(async (boardgame) => {
        await trx
          .insertInto("boardgamesCategories")
          .values(
            boardgame.categories.map((category) => ({
              boardgameId: boardgame.id,
              categoryId: category.id,
            })),
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }),
    );
  });

  console.log(`Seed was executed successfully`);

  await db.destroy();
} catch (error) {
  console.error("Failed to seed");
  console.error(error);
  process.exit(1);
}
