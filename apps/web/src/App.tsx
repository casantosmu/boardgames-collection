import { useState } from "react";
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
  alpha,
  styled,
  InputBase,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useQueryParams } from "./queryParams";
import { getImageSrc, useFetchBoardgames } from "./api";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

interface TableToolbarProps {
  initialSearchValue: string;
  onSearch: (searchValue: string) => void;
}

const TableToolbar = ({
  initialSearchValue,
  onSearch,
}: TableToolbarProps): JSX.Element => {
  const [search, setSearch] = useState(initialSearchValue);

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        variant="h6"
        id="tableTitle"
        component="div"
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        Boardgames
      </Typography>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onSearch(search);
            }
          }}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search…"
          value={search}
          inputProps={{ "aria-label": "search" }}
        />
      </Search>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Filter list">
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export function App(): JSX.Element {
  const [queryParams, setQueryParams] = useQueryParams((params) => ({
    page: Number(params["page"]) || 0,
    rowsPerPage: Number(params["rowsPerPage"]) || 25,
    search: String(params["search"] || ""),
  }));

  const { loading, error, data } = useFetchBoardgames({
    page: queryParams.page,
    rowsPerPage: queryParams.rowsPerPage,
    search: queryParams.search,
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
        <TableToolbar
          initialSearchValue={queryParams.search}
          onSearch={(searchValue) => {
            setQueryParams({
              search: searchValue,
              page: 0,
            });
          }}
        />
        <TableContainer>
          <Table aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="left">Title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((boardgame) => (
                <TableRow
                  key={boardgame.id}
                  hover
                  sx={{
                    cursor: "pointer",
                  }}
                >
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
          component="div"
          rowsPerPageOptions={[10, 25, 50]}
          count={data.metadata.count}
          rowsPerPage={queryParams.rowsPerPage}
          page={queryParams.page}
          onPageChange={(_, newPage) => {
            setQueryParams({
              page: newPage,
            });
          }}
          onRowsPerPageChange={(event) => {
            setQueryParams({
              rowsPerPage: parseInt(event.target.value, 10),
              page: 0,
            });
          }}
        />
      </Paper>
    </Box>
  );
}
