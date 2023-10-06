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

export const parseDuration = (
  value: string | null | undefined,
): z.SafeParseReturnType<number, readonly [number, number]> => {
  const split = value?.split("–", 2);

  const rangeResult = z
    .tuple([z.coerce.number().int(), z.coerce.number().int()])
    .safeParse(split);

  if (rangeResult.success) {
    return rangeResult;
  }

  const numberResult = z.coerce
    .number()
    .int()
    .transform((value) => [value, value] as const)
    .safeParse(value);

  return numberResult;
};

/**
 * Players are represented as:
 * - Individual: 3
 * - Individuals: 2, 4, 7
 * - Range: 2-6
 * - Range and more: 2-6+
 */
export const parsePlayers = (
  value: string | null | undefined,
): z.SafeParseReturnType<unknown, { players: number[]; more: boolean }> => {
  const numberResult = z.coerce
    .number()
    .int()
    .transform((value) => ({
      players: [value],
      more: false,
    }))
    .safeParse(value);

  if (numberResult.success) {
    return numberResult;
  }

  const numbersResult = z
    .string()
    .includes(", ")
    .transform((string) => {
      const split = string.split(",");
      const players = z.array(z.coerce.number().int()).parse(split);

      return {
        players,
        more: false,
      };
    })
    .safeParse(value);

  if (numbersResult.success) {
    return numbersResult;
  }

  const split = value?.split("–", 2);

  const tupleResult = z
    .tuple([z.coerce.number().int(), z.coerce.number().int()])
    .transform(([min, max]) => {
      const players: number[] = [];

      for (let i = min; i <= max; i++) {
        players.push(i);
      }

      return {
        players,
        more: false,
      };
    })
    .safeParse(split);

  if (tupleResult.success) {
    return tupleResult;
  }

  const tupleAndMoreResult = z
    .tuple([z.coerce.number().int(), z.string().trim().endsWith("+")])
    .transform(([min, maxAndMore]) => {
      const withoutPlus = maxAndMore.slice(0, maxAndMore.length - 2);
      const max = z.coerce.number().int().parse(withoutPlus);

      const players: number[] = [];

      for (let i = min; i <= max; i++) {
        players.push(i);
      }

      return {
        players,
        more: true,
      };
    })
    .safeParse(split);

  return tupleAndMoreResult;
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
