import { useState, useEffect } from "react";
import { Boardgames } from "dtos/v1";
import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

if (typeof import.meta.env["VITE_API_BASE_URL"] !== "string") {
  throw new Error("Must add VITE_API_BASE_URL env variable");
}

if (typeof import.meta.env["VITE_IMAGES_BASE_URL"] !== "string") {
  throw new Error("Must add VITE_IMAGES_BASE_URL env variable");
}

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"];
const IMAGES_BASE_URL = import.meta.env["VITE_IMAGES_BASE_URL"];

const getImageSrc = (url: string): string =>
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
  params?: Record<string, string | number>;
}

const useFetch = <T,>(
  url: string,
  options?: UseFetchOptions,
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const urlBuilder = new URL(url, API_BASE_URL);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      urlBuilder.searchParams.append(key, value.toString());
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

const useFetchBoardgames = (
  params: Boardgames["querystring"],
): UseFetchResult<Boardgames["response"]["200"]> => {
  return useFetch("/v1/boardgames", {
    params,
  });
};

export function App(): JSX.Element {
  const [search, setSearch] = useSearchParams(
    new URLSearchParams({
      page: "0",
      rowsPerPage: "25",
    }),
  );

  const page = Number(search.get("page"));
  const rowsPerPage = Number(search.get("rowsPerPage"));

  const { loading, error, data } = useFetchBoardgames({
    page,
    rowsPerPage,
  });

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Something unexpected occurred. Please try refreshing the page.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Paper>
        <Box
          sx={{
            paddingY: 6,
            paddingX: 2,
          }}
        >
          <LinearProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table /** sx={{ minWidth: 750 }} */ aria-label="boardgames">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="left">Title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((boardgame) => (
                <TableRow key={boardgame.id}>
                  <TableCell width={80}>
                    <img
                      height={64}
                      width={64}
                      alt={boardgame.name}
                      src={getImageSrc(boardgame.images["96x96"])}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {boardgame.name}{" "}
                    <Box sx={{ color: "text.secondary", display: "inline" }}>
                      ({boardgame.yearPublished})
                    </Box>
                    <Box
                      paddingBottom={boardgame.shortDescription ? 0 : "20px"}
                    >
                      {boardgame.shortDescription}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          count={data.metadata.count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => {
            setSearch({
              rowsPerPage: rowsPerPage.toString(),
              page: newPage.toString(),
            });
          }}
          onRowsPerPageChange={(event) => {
            setSearch({
              rowsPerPage: event.target.value,
              page: "0",
            });
          }}
        />
      </Paper>
    </Box>
  );
}
