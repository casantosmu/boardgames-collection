type UndefinedToOptional<T extends Record<string, unknown>> = {
  [P in keyof T as undefined extends T[P] ? P : never]?: Exclude<
    T[P],
    undefined
  >;
} & {
  [P in keyof T as undefined extends T[P] ? never : P]: T[P];
};

export const removeUndefinedValuesFromObject = <
  T extends { [P in keyof T]: unknown },
>(
  object: T,
): UndefinedToOptional<T> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as UndefinedToOptional<T>;
};

interface Ok<T> {
  success: true;
  data: T;
}

interface Err<E> {
  success: false;
  error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <const T>(data: T): Ok<T> => ({
  success: true,
  data,
});

export const err = <const E>(error: E): Err<E> => ({
  success: false,
  error,
});
