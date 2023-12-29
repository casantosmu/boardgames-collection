import { type ZodObject, type ZodString } from "zod";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { objectKeys } from "../utils";

type Values = Record<string, string>;

type Errors<TValues> = Record<keyof TValues, boolean>;

interface Input<T extends Values> {
  name: keyof T;
  value: T[keyof T];
  error: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

type Inputs<TValues extends Values> = Record<keyof TValues, Input<TValues>>;

const resetErrors = <TValues extends Values>(
  values: TValues,
): Errors<TValues> => {
  const result = {} as Errors<TValues>;
  for (const key of objectKeys(values)) {
    result[key] = false;
  }
  return result;
};

interface Form<TValues extends Values> {
  inputs: Inputs<TValues>;
  errors: Errors<TValues>;
  handleSubmit: (
    onSuccess: (data: TValues) => void,
  ) => (event: FormEvent<HTMLFormElement>) => void;
  reset: (data: TValues) => void;
}

interface FormProps<TValues extends Values> {
  initialValues: TValues;
  schema?: ZodObject<Record<keyof TValues, ZodString>>;
}

export const useForm = <TValues extends Values>({
  initialValues,
  schema,
}: FormProps<TValues>): Form<TValues> => {
  const [data, setData] = useState(initialValues);
  const [errors, setErrors] = useState(() => {
    return resetErrors(data);
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name as keyof TValues;
    const value = event.target.value;
    if (schema && errors[field]) {
      const validation = schema.shape[field].safeParse(value);
      setErrors({
        ...errors,
        [field]: !validation.success,
      });
    }
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit =
    (onSuccess: (data: TValues) => void) =>
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      if (!schema) {
        onSuccess(data);
        return;
      }

      const validation = schema.safeParse(data);
      if (validation.success) {
        setErrors(resetErrors(data));
        onSuccess(data);
      } else {
        const validationErrors = validation.error.flatten();
        const resetError = { ...errors };
        for (const key of objectKeys(validationErrors.fieldErrors)) {
          resetError[key] = true;
        }
        setErrors(resetError);
      }
    };

  const reset = (data: TValues): void => {
    setData(data);
  };

  const inputs = {} as Inputs<TValues>;
  for (const key of objectKeys(initialValues)) {
    inputs[key] = {
      name: key,
      value: data[key],
      error: errors[key],
      onChange: handleChange,
    };
  }

  return { inputs, errors, handleSubmit, reset };
};
