import { useEffect, useReducer } from "react";
import { DtosV1 } from "common";

export const getImageSrc = (path: string): string => path;

type Params = Record<
  string,
  string | number | boolean | (string | number | boolean)[]
>;

const getApiUrl = (path: string, params?: Params): string => {
  const url = new URL(
    `/api${path.startsWith("/") ? path : `/${path}`}`,
    location.origin,
  );

  if (!params) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item.toString());
      }
    } else {
      url.searchParams.append(key, value.toString());
    }
  }
  return url.toString();
};

type FetchState<TData> =
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
      error: DtosV1["ApiError"];
      data: null;
    }
  | {
      status: "success";
      error: null;
      data: TData;
    };

type FetchAction<TData> =
  | { type: "INIT" }
  | { type: "SUCCESS"; payload: TData }
  | { type: "ERROR"; payload: DtosV1["ApiError"] };

const fetchReducer = <TData>(
  state: FetchState<TData>,
  action: FetchAction<TData>,
): FetchState<TData> => {
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

interface UseQueryFetch {
  params?: Params;
}

const useQuery = <TData>(
  path: string,
  fetchOptions?: UseQueryFetch,
): FetchState<TData> => {
  const [state, dispatch] = useReducer(fetchReducer<TData>, {
    status: "idle",
    error: null,
    data: null,
  });

  const url = getApiUrl(path, fetchOptions?.params);

  useEffect(() => {
    let ignore = false;

    const fetchData = async (): Promise<void> => {
      dispatch({ type: "INIT" });

      const response = await fetch(url);
      const text = await response.text();

      if (response.ok && !ignore) {
        const data =
          text.length > 0 ? (JSON.parse(text) as TData) : (undefined as TData);
        dispatch({ type: "SUCCESS", payload: data });
      } else if (!ignore) {
        const error = JSON.parse(text) as DtosV1["ApiError"];
        dispatch({ type: "ERROR", payload: error });
      }
    };

    void fetchData();

    return () => {
      ignore = true;
    };
  }, [url]);

  return state;
};

interface UseMutationFetch {
  method: "GET" | "POST" | "PUT";
  params?: Params;
}

interface UseMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: DtosV1["ApiError"]) => void;
}

type UseMutation<TBody, TData> = FetchState<TData> & {
  mutate: (body: TBody) => void;
};

const useMutation = <TBody, TData>(
  path: string,
  fetchOptions: UseMutationFetch,
  options?: UseMutationOptions<TData>,
): UseMutation<TBody, TData> => {
  const [state, dispatch] = useReducer(fetchReducer<TData>, {
    status: "idle",
    error: null,
    data: null,
  });

  const url = getApiUrl(path, fetchOptions.params);

  const mutate = (body: TBody): void => {
    const fetchData = async (): Promise<void> => {
      dispatch({ type: "INIT" });

      const response = await fetch(url, {
        method: fetchOptions.method,
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const text = await response.text();

      if (response.ok) {
        const data =
          text.length > 0 ? (JSON.parse(text) as TData) : (undefined as TData);
        dispatch({ type: "SUCCESS", payload: data });
        options?.onSuccess?.(data);
      } else {
        const error = JSON.parse(text) as DtosV1["ApiError"];
        dispatch({ type: "ERROR", payload: error });
        options?.onError?.(error);
      }
    };

    void fetchData();
  };

  return { ...state, mutate };
};

export const useBoardgamesQuery = (
  params: DtosV1["GetBoardgames"]["Querystring"],
): FetchState<DtosV1["GetBoardgames"]["Response"][200]> => {
  return useQuery("/v1/boardgames", { params });
};

export const useRegisterMutation = (
  options?: UseMutationOptions<DtosV1["Register"]["Response"][200]>,
): UseMutation<
  DtosV1["Register"]["Body"],
  DtosV1["Register"]["Response"][200]
> => {
  return useMutation("/v1/auth/register", { method: "POST" }, options);
};

export const useLoginMutation = (
  options?: UseMutationOptions<DtosV1["Login"]["Response"][200]>,
): UseMutation<DtosV1["Login"]["Body"], DtosV1["Login"]["Response"][200]> => {
  return useMutation("/v1/auth/login", { method: "POST" }, options);
};

export const useLogoutMutation = (
  options?: UseMutationOptions<undefined>,
): UseMutation<void, undefined> => {
  return useMutation("/v1/auth/logout", { method: "GET" }, options);
};
