import { useState, useEffect } from "react";
import { Boardgames } from "dtos/v1";

const API_BASE_URL: unknown = import.meta.env["VITE_API_BASE_URL"];

if (typeof API_BASE_URL !== "string") {
  throw new Error("Must add VITE_API_BASE_URL env variable");
}

type UseFetchResult<T> =
  | {
      loading: true;
      error: false;
      data: null;
    }
  | {
      loading: false;
      error: true;
      data: null;
    }
  | {
      loading: false;
      error: false;
      data: T;
    };

const useFetch = <T,>(url: string): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    setData(null);
    fetch(new URL(url, API_BASE_URL))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} (${response.statusText})`);
        }
        return response.json();
      })
      .then((data: T) => {
        if (!ignore) {
          setData(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  if (error) {
    return {
      loading: false,
      error: true,
      data: null,
    };
  }

  if (!data) {
    return {
      loading: true,
      error: false,
      data: null,
    };
  }

  return {
    loading: false,
    error: false,
    data: data,
  };
};

export function App(): JSX.Element {
  const { loading, error, data } =
    useFetch<Boardgames["response"]["200"]>("/v1/boardgames");

  if (error) {
    return <>Error</>;
  }

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <ul>
      {data.data.map((boardgame) => (
        <li key={boardgame.id}>{boardgame.name}</li>
      ))}
    </ul>
  );
}
