import fs from "node:fs/promises";
import axios from "axios";
import { z } from "zod";

export const coerceNumber = (
  value: unknown,
): z.SafeParseReturnType<number, number> => z.coerce.number().safeParse(value);

export const coerceIntNumber = (
  value: unknown,
): z.SafeParseReturnType<number, number> =>
  z.coerce.number().int().safeParse(value);

export const parseIdFromUrl = (
  url: string | null | undefined,
): z.SafeParseReturnType<number, number> => {
  const urlParts = url?.split("/");
  return coerceIntNumber(urlParts?.[urlParts.length - 2]);
};

export const parseRange = (
  value: string | null | undefined,
): z.SafeParseReturnType<number, readonly [number, number]> => {
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

export const downloadImage = async (
  imageSrc: string,
  filePath: string,
): Promise<void> => {
  const { data } = await axios.get<ArrayBuffer>(imageSrc, {
    responseType: "arraybuffer",
  });

  await fs.writeFile(filePath, Buffer.from(data));
};
