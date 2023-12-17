import { useLocation, useNavigate } from "react-router-dom";

const urlSearchParamsToObject = (
  urlSearchParams: URLSearchParams,
): Record<string, string | string[]> => {
  const object: Record<string, string | string[]> = {};
  for (const key of urlSearchParams.keys()) {
    if (key.endsWith("[]")) {
      object[key.slice(0, -2)] = urlSearchParams.getAll(key);
    } else {
      const value = urlSearchParams.get(key);
      if (value !== null) {
        object[key] = value;
      }
    }
  }
  return object;
};

export const useQueryParams = <
  TQueryParams extends {
    [P in keyof TQueryParams]:
      | string
      | number
      | boolean
      | (string | number | boolean)[]
      | undefined;
  },
>(
  transform: (params: Record<string, unknown>) => TQueryParams,
): [TQueryParams, (params: Partial<TQueryParams>) => void] => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = transform(
    urlSearchParamsToObject(new URLSearchParams(location.search)),
  );

  const setQueryParams = (params: Partial<TQueryParams>): void => {
    const urlSearchParams = new URLSearchParams(location.search);
    const queryParams = transform(
      Object.assign(urlSearchParamsToObject(urlSearchParams), params),
    );
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined) {
        urlSearchParams.delete(key);
      } else if (Array.isArray(value)) {
        urlSearchParams.delete(`${key}[]`);
        for (const item of value) {
          urlSearchParams.append(`${key}[]`, String(item));
        }
      } else {
        urlSearchParams.set(key, String(value));
      }
    }
    navigate(`?${urlSearchParams.toString()}`);
  };

  return [queryParams, setQueryParams];
};
