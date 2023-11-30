import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .createTable("users")
    .addColumn("user_id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("password", "text", (col) => col.notNull())
    .execute();
};

export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema.dropTable("users").execute();
};
