import { useEffect, useState } from "react";
import { Boardgames, Classifications } from "dtos/v1";
import { API_BASE_URL, IMAGES_BASE_URL } from "./config";

export const getImageSrc = (url: string): string =>
  new URL(url, IMAGES_BASE_URL).toString();

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

const useFetch = <T>(
  url: string,
  options?: UseFetchOptions,
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const urlBuilder = new URL(url, API_BASE_URL);
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
  const urlResult = urlBuilder.toString();

  useEffect(() => {
    let ignore = false;
    setData(null);
    fetch(urlResult)
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
  }, [urlResult]);

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
  params: Boardgames["querystring"],
): UseFetchResult<Boardgames["response"]["200"]> => {
  return useFetch("/v1/boardgames", {
    params,
  });
};

export const useFetchClassifications = (): UseFetchResult<
  Classifications["response"]["200"]
> => {
  return useFetch("/v1/classifications");
};
