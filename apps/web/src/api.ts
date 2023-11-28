import { useEffect, useState } from "react";
import { GetBoardgames, GetClassifications } from "dtos/v1";

export const getImageSrc = (path: string): string => path;

class ApiError extends Error {
  constructor(readonly statusCode: number) {
    super();
  }
}

type UseFetchResult<T> =
  | {
      loading: true;
      error: null;
      data: null;
    }
  | {
      loading: false;
      error: ApiError;
      data: null;
    }
  | {
      loading: false;
      error: null;
      data: T;
    };

interface UseFetchOptions {
  params?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
}

const getApiUrl = (origin: string, path: string): string =>
  `${origin.endsWith("/") ? origin.slice(0, -1) : origin}/api/${
    path.startsWith("/") ? path.slice(1) : path
  }`;

const useFetch = <T>(
  path: string,
  options?: UseFetchOptions,
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const urlBuilder = new URL(getApiUrl(location.origin, path));
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          urlBuilder.searchParams.append(key, item.toString());
        }
      } else {
        urlBuilder.searchParams.append(key, value.toString());
      }
    }
  }
  const url = urlBuilder.toString();

  useEffect(() => {
    let ignore = false;
    setData(null);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new ApiError(response.status);
        }
        return response.json();
      })
      .then((data: T) => {
        if (!ignore) {
          setData(data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setError(error instanceof ApiError ? error : new ApiError(500));
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  if (error) {
    return {
      loading: false,
      error,
      data: null,
    };
  }

  if (!data) {
    return {
      loading: true,
      error: null,
      data: null,
    };
  }

  return {
    loading: false,
    error: null,
    data,
  };
};

export const useFetchBoardgames = (
  params: GetBoardgames["querystring"],
): UseFetchResult<GetBoardgames["response"]["200"]> => {
  return useFetch("/v1/boardgames", {
    params,
  });
};

export const useFetchClassifications = (): UseFetchResult<
  GetClassifications["response"]["200"]
> => {
  return useFetch("/v1/classifications");
};
