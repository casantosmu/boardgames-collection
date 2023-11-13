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
  TableRow,
} from "@mui/material";

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
    <TableContainer component={Paper}>
      <Table aria-label="boardgames table">
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
                <Box paddingBottom={boardgame.shortDescription ? 0 : "20px"}>
                  {boardgame.shortDescription}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
