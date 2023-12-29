import { z } from "zod";

const PageQuerySchema = z.coerce.number().int().nonnegative().catch(0);

const RowsPerPageQuerySchema = z.coerce
  .number()
  .int()
  .positive()
  .max(100)
  .catch(25);

const SearchQuerySchema = z.string().optional().catch(undefined);

const PlayerQuerySchema = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .catch(undefined);

const ClassificationQuerySchema = z
  .array(z.coerce.number().int().nonnegative())
  .optional()
  .catch(undefined);

const WeightQuerySchema = z.coerce
  .number()
  .int()
  .min(0)
  .max(5)
  .optional()
  .catch(undefined);

export const QueryParamsSchema = z.object({
  page: PageQuerySchema,
  rowsPerPage: RowsPerPageQuerySchema,
  search: SearchQuerySchema,
  minPlayers: PlayerQuerySchema,
  maxPlayers: PlayerQuerySchema,
  minBestPlayers: PlayerQuerySchema,
  maxBestPlayers: PlayerQuerySchema,
  types: ClassificationQuerySchema,
  categories: ClassificationQuerySchema,
  mechanisms: ClassificationQuerySchema,
  weight: WeightQuerySchema,
});

export type QueryParamsSchema = z.infer<typeof QueryParamsSchema>;

export const parseQueryParams = (params: unknown): QueryParamsSchema =>
  QueryParamsSchema.parse(params);
