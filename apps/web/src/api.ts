import { useEffect, useState } from "react";
import {
  GetBoardgames,
  GetClassifications,
  ApiError,
  Login,
  Register,
} from "common/dtos/v1";

export const getImageSrc = (path: string): string => path;

interface Ok<T> {
  success: true;
  data: T;
}

interface Err {
  success: false;
  error: ApiError;
}

type Result<T> = Ok<T> | Err;

const ok = <T>(data: T): Ok<T> => ({
  success: true,
  data,
});

const err = (error: ApiError): Err => ({
  success: false,
  error,
});

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

const getApiUrl = (path: string): string => {
  const origin = location.origin;
  return `${origin.endsWith("/") ? origin.slice(0, -1) : origin}/api/${
    path.startsWith("/") ? path.slice(1) : path
  }`;
};

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

export const register = async (
  body: Register["body"],
): Promise<Result<Register["response"]["200"]>> => {
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
  return ok(data as Register["response"]["200"]);
};

export const login = async (
  body: Login["body"],
): Promise<Result<Login["response"]["200"]>> => {
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
  return ok(data as Login["response"]["200"]);
};

export const logout = async (): Promise<void> => {
  const response = await fetch(getApiUrl("/v1/auth/logout"));
  if (!response.ok) {
    throw new Error(response.statusText);
  }
};
