import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const coerceNumber = (value: unknown) =>
  z.coerce.number().safeParse(value);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const coerceIntNumber = (value: unknown) =>
  z.coerce.number().int().safeParse(value);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const parseIdFromUrl = (url: string | null | undefined) => {
  const urlParts = url?.split("/");
  return coerceIntNumber(urlParts?.[urlParts.length - 2]);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const parseRange = (value: string | null | undefined) => {
  const split = value?.split("–", 2);

  const tupleResult = z
    .tuple([z.coerce.number().int(), z.coerce.number().int()])
    .safeParse(split);

  if (tupleResult.success) {
    return tupleResult;
  }

  const numberResult = z.coerce
    .number()
    .int()
    .transform((value) => [value, value] as const)
    .safeParse(value);

  return numberResult;
};
