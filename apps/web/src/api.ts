import { useEffect, useReducer } from "react";
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

type FetchState<T> =
  | {
      status: "idle";
      error: null;
      data: null;
    }
  | {
      status: "loading";
      error: null;
      data: null;
    }
  | {
      status: "error";
      error: ApiError;
      data: null;
    }
  | {
      status: "success";
      error: null;
      data: T;
    };

type FetchAction<T> =
  | { type: "INIT" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; payload: ApiError };

const fetchReducer = <T>(
  state: FetchState<T>,
  action: FetchAction<T>,
): FetchState<T> => {
  switch (action.type) {
    case "INIT": {
      return {
        status: "loading",
        error: null,
        data: null,
      };
    }
    case "ERROR": {
      return {
        status: "error",
        error: action.payload,
        data: null,
      };
    }
    case "SUCCESS": {
      return {
        status: "success",
        error: null,
        data: action.payload,
      };
    }
  }
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
): FetchState<T> => {
  const [state, dispatch] = useReducer(fetchReducer<T>, {
    status: "idle",
    error: null,
    data: null,
  });

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

    const fetchData = async (): Promise<void> => {
      dispatch({ type: "INIT" });

      const response = await fetch(url);
      const data: unknown = await response.json();

      if (!response.ok && !ignore) {
        dispatch({ type: "ERROR", payload: data as ApiError });
      } else if (!ignore) {
        dispatch({ type: "SUCCESS", payload: data as T });
      }
    };

    void fetchData();

    return () => {
      ignore = true;
    };
  }, [url]);

  return state;
};

export const useFetchBoardgames = (
  params: GetBoardgames["querystring"],
): FetchState<GetBoardgames["response"][200]> => {
  return useFetch("/v1/boardgames", {
    params,
  });
};

export const useFetchClassifications = (): FetchState<
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
