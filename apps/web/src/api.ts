import { useEffect, useState } from "react";
import {
  GetBoardgames,
  GetClassifications,
  ApiError,
  Login,
  Register,
} from "common/dtos/v1";
import { Result, err, ok } from "./utils";

const INTERNAL_APP_FETCH_ERROR = {
  code: "INTERNAL_APP_FETCH_ERROR",
  message: "Something unexpected occurred ",
} as const;

export const getImageSrc = (path: string): string => path;

const getApiUrl = (path: string): string => {
  const origin = location.origin;
  return `${origin.endsWith("/") ? origin.slice(0, -1) : origin}/api/${
    path.startsWith("/") ? path.slice(1) : path
  }`;
};

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
  path: string,
  options?: UseFetchOptions,
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const urlBuilder = new URL(getApiUrl(path));
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

    const doFetch = async (): Promise<void> => {
      setData(null);

      const response = await fetch(url);
      const data: unknown = await response.json();

      if (!response.ok && !ignore) {
        setError(data as ApiError);
      } else if (!ignore) {
        setData(data as T);
      }
    };

    void doFetch();
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

  if (data === null) {
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
): UseFetchResult<GetBoardgames["response"][200]> => {
  return useFetch("/v1/boardgames", {
    params,
  });
};

export const useFetchClassifications = (): UseFetchResult<
  GetClassifications["response"][200]
> => {
  return useFetch("/v1/classifications");
};

type FetchResult<T> = Result<T, ApiError>;

export const register = async (
  body: Register["body"],
): Promise<FetchResult<Register["response"][200]>> => {
  try {
    const response = await fetch(getApiUrl("/v1/auth/register"), {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data: unknown = await response.json();
    if (!response.ok) {
      return err(data as ApiError);
    }
    return ok(data as Register["response"][200]);
  } catch {
    return err(INTERNAL_APP_FETCH_ERROR);
  }
};

export const login = async (
  body: Login["body"],
): Promise<FetchResult<Login["response"][200]>> => {
  try {
    const response = await fetch(getApiUrl("/v1/auth/login"), {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data: unknown = await response.json();
    if (!response.ok) {
      return err(data as ApiError);
    }
    return ok(data as Login["response"][200]);
  } catch {
    return err(INTERNAL_APP_FETCH_ERROR);
  }
};

export const logout = async (): Promise<FetchResult<undefined>> => {
  try {
    const response = await fetch(getApiUrl("/v1/auth/logout"));
    if (!response.ok) {
      const data = (await response.json()) as ApiError;
      return err(data);
    }
    return ok(undefined);
  } catch {
    return err(INTERNAL_APP_FETCH_ERROR);
  }
};
