import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DtosV1 } from "common";

export const classificationsRoutes: FastifyPluginAsyncTypebox = async (
  fastify,
) => {
  fastify.get(
    "/classifications",
    {
      schema: {
        summary: "Get a list of boardgames types, categories and mechanisms",
        tags: ["classifications"],
        response: {
          200: {
            ...DtosV1.GetClassifications.Response[200],
            description: "Success",
          },
          500: DtosV1.Errors[500],
        },
      },
    },
    async () => {
      return fastify.kysely.transaction().execute(async (trx) => {
        const [types, categories, mechanisms] = await Promise.all([
          trx
            .selectFrom("types as t")
            .select(["t.typeId as id", "t.typeName as name"])
            .orderBy("t.typeName")
            .execute(),
          trx
            .selectFrom("categories as c")
            .select(["c.categoryId as id", "c.categoryName as name"])
            .orderBy("c.categoryName")
            .execute(),
          trx
            .selectFrom("mechanisms as m")
            .select(["m.mechanismId as id", "m.mechanismName as name"])
            .orderBy("m.mechanismName")
            .execute(),
        ]);

        return { data: { types, categories, mechanisms } };
      });
    },
  );
};
