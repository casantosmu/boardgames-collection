import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getClassifications } from "common/dtos/v1";

export const classificationsRoutes: FastifyPluginAsyncTypebox = async (
  fastify,
) => {
  fastify.get("/classifications", { schema: getClassifications }, async () => {
    return fastify.kysely.transaction().execute(async (trx) => {
      const [types, categories, mechanisms] = await Promise.all([
        trx
          .selectFrom("types as t")
          .select("t.type")
          .orderBy("t.type")
          .execute(),
        trx
          .selectFrom("categories as c")
          .select("c.category")
          .orderBy("c.category")
          .execute(),
        trx
          .selectFrom("mechanisms as m")
          .select("m.mechanism")
          .orderBy("m.mechanism")
          .execute(),
      ]);

      return {
        data: {
          types: types.map((type) => type.type),
          categories: categories.map((category) => category.category),
          mechanisms: mechanisms.map((mechanism) => mechanism.mechanism),
        },
      };
    });
  });
};
