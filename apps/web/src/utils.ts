type UndefinedToOptional<Type extends Record<string, unknown>> = {
  [P in keyof Type as undefined extends Type[P] ? P : never]?: Exclude<
    Type[P],
    undefined
  >;
} & {
  [P in keyof Type as undefined extends Type[P] ? never : P]: Type[P];
};

export const removeUndefinedValuesFromObject = <
  Type extends { [P in keyof Type]: unknown },
>(
  object: Type,
): UndefinedToOptional<Type> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as UndefinedToOptional<Type>;
};

type ObjectKeys<Type extends { [P in keyof Type]: unknown }> = `${Exclude<
  keyof Type,
  symbol
>}`;

export const objectKeys = Object.keys as <
  Type extends { [P in keyof Type]: unknown },
>(
  value: Type,
) => ObjectKeys<Type>[];
