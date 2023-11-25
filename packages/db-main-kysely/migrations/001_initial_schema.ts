import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .createTable("boardgames")
    .addColumn("boardgame_id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("rate", "real", (col) =>
      col
        .notNull()
        .defaultTo(0)
        .check(sql`rate >= 0`),
    )
    .addColumn("boardgame_name", "text", (col) => col.notNull())
    .addColumn("year_published", "int2", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("short_description", "text")
    .addColumn("complexity", "real", (col) =>
      col.notNull().check(sql`complexity >= 0`),
    )
    .addColumn("min_age", "integer", (col) =>
      col.notNull().check(sql`min_age >= 0`),
    )
    .addColumn("min_players", "integer", (col) =>
      col.notNull().check(sql`min_players >= 0 AND min_players <= max_players`),
    )
    .addColumn("max_players", "integer", (col) =>
      col.check(sql`max_players >= 0 AND max_players >= min_players`),
    )
    .addColumn("min_duration", "integer", (col) =>
      col
        .notNull()
        .check(sql`min_duration >= 0 AND min_duration <= max_duration`),
    )
    .addColumn("max_duration", "integer", (col) =>
      col
        .notNull()
        .check(sql`max_duration >= 0 AND max_duration >= min_duration`),
    )
    .execute();

  await db.schema
    .createTable("alternate_names")
    .addColumn("alternate_name", "text", (col) => col.notNull())
    .addColumn("boardgame_id", "integer", (col) =>
      col.notNull().references("boardgames.boardgame_id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("alternate_names_pkey", [
      "alternate_name",
      "boardgame_id",
    ])
    .execute();

  await db.schema
    .createTable("best_players")
    .addColumn("best_players_id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("min_players", "integer", (col) =>
      col.notNull().check(sql`min_players >= 0 AND min_players <= max_players`),
    )
    .addColumn("max_players", "integer", (col) =>
      col.check(sql`max_players >= 0 AND max_players >= min_players`),
    )
    .addColumn("boardgame_id", "integer", (col) =>
      col.notNull().references("boardgames.boardgame_id").onDelete("cascade"),
    )
    .addUniqueConstraint(
      "best_players_min_players_max_players_boardgame_id_key",
      ["min_players", "max_players", "boardgame_id"],
    )
    .execute();

  await db.schema
    .createTable("categories")
    .addColumn("category", "text", (col) => col.primaryKey().notNull())
    .execute();

  await db.schema
    .createTable("mechanisms")
    .addColumn("mechanism", "text", (col) => col.primaryKey().notNull())
    .execute();

  await db.schema
    .createTable("types")
    .addColumn("type", "text", (col) => col.primaryKey().notNull())
    .execute();

  await db.schema
    .createTable("boardgames_categories")
    .addColumn("category", "text", (col) =>
      col
        .notNull()
        .references("categories.category")
        .onUpdate("cascade")
        .onDelete("cascade"),
    )
    .addColumn("boardgame_id", "integer", (col) =>
      col.notNull().references("boardgames.boardgame_id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("boardgames_categories_pkey", [
      "category",
      "boardgame_id",
    ])
    .execute();

  await db.schema
    .createTable("boardgames_mechanisms")
    .addColumn("mechanism", "text", (col) =>
      col
        .notNull()
        .references("mechanisms.mechanism")
        .onUpdate("cascade")
        .onDelete("cascade"),
    )
    .addColumn("boardgame_id", "integer", (col) =>
      col.notNull().references("boardgames.boardgame_id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("boardgames_mechanisms_pkey", [
      "mechanism",
      "boardgame_id",
    ])
    .execute();

  await db.schema
    .createTable("boardgames_types")
    .addColumn("type", "text", (col) =>
      col
        .notNull()
        .references("types.type")
        .onUpdate("cascade")
        .onDelete("cascade"),
    )
    .addColumn("boardgame_id", "integer", (col) =>
      col.notNull().references("boardgames.boardgame_id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("boardgames_types_pkey", ["type", "boardgame_id"])
    .execute();
};

export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema.dropTable("boardgames").execute();
  await db.schema.dropTable("alternate_names").execute();
  await db.schema.dropTable("best_players").execute();
  await db.schema.dropTable("categories").execute();
  await db.schema.dropTable("mechanisms").execute();
  await db.schema.dropTable("types").execute();
  await db.schema.dropTable("boardgames_categories").execute();
  await db.schema.dropTable("boardgames_mechanisms").execute();
  await db.schema.dropTable("boardgames_types").execute();
};
