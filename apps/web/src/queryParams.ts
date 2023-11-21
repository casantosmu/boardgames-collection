import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useQueryParams = <
  T extends Record<string, string | number | boolean>,
>(
  transform: (params: Record<string, unknown>) => T,
): [T, (params: Partial<T>) => void] => {
  const location = useLocation();
  const navigate = useNavigate();

  const rawQueryParams = useMemo(
    () => Object.fromEntries(new URLSearchParams(location.search)),
    [location.search],
  );

  const queryParams = transform(rawQueryParams);

  const setQueryParams = (params: Partial<T>): void => {
    const urlSearchParams = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(params)) {
      urlSearchParams.set(key, String(value));
    }
    navigate(`?${urlSearchParams.toString()}`);
  };

  return [queryParams, setQueryParams];
};
