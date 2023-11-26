import { type FormEvent, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  TablePagination,
  styled,
  InputBase,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  List,
  Drawer,
  ListItemAvatar,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { Boardgames as BoardgamesDto } from "dtos/v1";
import { z } from "zod";
import { useQueryParams } from "./queryParams";
import { getImageSrc, useFetchBoardgames } from "./api";

const filtersSchemas = {
  rowsPerPage: z.coerce.number().int().positive().max(100).catch(25),
  page: z.coerce.number().int().nonnegative().catch(0),
  search: z.string().trim().optional().catch(undefined),
  players: z.coerce.number().int().positive().optional().catch(undefined),
};

const SearchIconWrapper = styled("div")(() => ({
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
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(2)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

interface ListToolbarProps {
  initialSearchValue: string | undefined;
  onSearch: (searchValue: string | undefined) => void;
  onClickFiltersIcon: () => void;
}

const ListToolbar = ({
  initialSearchValue,
  onSearch,
  onClickFiltersIcon,
}: ListToolbarProps): JSX.Element => {
  const [search, setSearch] = useState(initialSearchValue ?? "");

  return (
    <Toolbar>
      <Typography
        variant="h6"
        id="listTitle"
        component="div"
        sx={{ display: { xs: "none", md: "block" }, paddingRight: 4 }}
      >
        Boardgames
      </Typography>
      <Box sx={{ position: "relative" }}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              const value = filtersSchemas.search.parse(search);
              onSearch(value);
              setSearch(value ?? "");
            }
          }}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search…"
          value={search}
          inputProps={{ "aria-label": "search" }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip
        title="Filter list"
        onClick={() => {
          onClickFiltersIcon();
        }}
        sx={{ display: { md: "none" } }}
      >
        <IconButton aria-label="open filters">
          <FilterListIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

const SIDEBAR_WITH = 240;

interface FiltersSidebar {
  minBestPlayers: number | undefined;
  maxBestPlayers: number | undefined;
  minPlayers: number | undefined;
  maxPlayers: number | undefined;
}

interface FiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  initialValues: FiltersSidebar;
  onFilter: (values: FiltersSidebar) => void;
}

const FiltersSidebar = ({
  open,
  onClose,
  initialValues,
  onFilter,
}: FiltersSidebarProps): JSX.Element => {
  const [filters, setFilters] = useState({
    minPlayers: initialValues.minPlayers?.toString() ?? "",
    maxPlayers: initialValues.maxPlayers?.toString() ?? "",
    minBestPlayers: initialValues.minBestPlayers?.toString() ?? "",
    maxBestPlayers: initialValues.maxBestPlayers?.toString() ?? "",
  });

  const handleOnSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const minPlayers = filtersSchemas.players.parse(filters.minPlayers);
    const maxPlayers = filtersSchemas.players.parse(filters.maxPlayers);
    const minBestPlayers = filtersSchemas.players.parse(filters.minBestPlayers);
    const maxBestPlayers = filtersSchemas.players.parse(filters.maxBestPlayers);
    onFilter({
      minPlayers,
      maxPlayers,
      minBestPlayers,
      maxBestPlayers,
    });
    setFilters({
      minPlayers: minPlayers?.toString() ?? "",
      maxPlayers: maxPlayers?.toString() ?? "",
      minBestPlayers: minBestPlayers?.toString() ?? "",
      maxBestPlayers: maxBestPlayers?.toString() ?? "",
    });
    onClose();
  };

  const body = (
    <>
      <Toolbar />
      <Divider />
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          handleOnSubmit(event);
        }}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            id="min-players"
            label="Min"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setFilters({
                ...filters,
                minPlayers: event.target.value,
              });
            }}
            value={filters.minPlayers}
            inputProps={{ "aria-label": "Min players" }}
          />
          <TextField
            id="max-players"
            label="Max"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setFilters({
                ...filters,
                maxPlayers: event.target.value,
              });
            }}
            value={filters.maxPlayers}
            inputProps={{ "aria-label": "Max players" }}
          />
          <Button type="submit">Go</Button>
        </Stack>
      </Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          handleOnSubmit(event);
        }}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Best players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            id="min-best-players"
            label="Min"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setFilters({
                ...filters,
                minBestPlayers: event.target.value,
              });
            }}
            value={filters.minBestPlayers}
            inputProps={{ "aria-label": "Min best players" }}
          />
          <TextField
            id="max-best-players"
            label="Max"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setFilters({
                ...filters,
                maxBestPlayers: event.target.value,
              });
            }}
            value={filters.maxBestPlayers}
            inputProps={{ "aria-label": "Max best players" }}
          />
          <Button type="submit">Go</Button>
        </Stack>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        width: { md: SIDEBAR_WITH },
      }}
      aria-label="Filters"
    >
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => {
          onClose();
        }}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WITH,
          },
        }}
      >
        {body}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WITH,
          },
        }}
      >
        {body}
      </Drawer>
    </Box>
  );
};

interface PlayersRange {
  min: number;
  max: number | null;
}

const buildPlayersRangeString = (
  { min, max }: PlayersRange,
  separator: string,
): string => {
  if (min === max) {
    return `${min}`;
  }
  if (max === null) {
    return `${min}+`;
  }
  const range = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }
  return range.join(separator);
};

interface BoardgamesListItem {
  id: number;
  name: string;
  images: {
    "96x96": string;
  };
  yearPublished: number;
  shortDescription: string | null;
  rate: number;
  complexity: number;
  duration: {
    min: number;
    max: number;
  };
  minAge: number;
  players: PlayersRange;
  bestPlayers: PlayersRange[];
}

interface BoardgamesListProps {
  boardgames: BoardgamesListItem[];
}

const BoardgamesList = ({ boardgames }: BoardgamesListProps): JSX.Element => {
  return (
    <List aria-labelledby="listTitle">
      {boardgames.map((boardgame) => (
        <ListItem key={boardgame.id}>
          <ListItemButton component={Link} to={`/boardgames/${boardgame.id}`}>
            <ListItemAvatar sx={{ width: 80 }}>
              <img
                height={64}
                width={64}
                alt={boardgame.name}
                src={getImageSrc(boardgame.images["96x96"])}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  {boardgame.name}{" "}
                  <Box
                    sx={{
                      color: "text.secondary",
                      display: "inline",
                    }}
                  >
                    ({boardgame.yearPublished})
                  </Box>
                </>
              }
              secondary={
                <>
                  {boardgame.shortDescription}
                  <Box sx={{ paddingTop: 1 }}>
                    Rating: {boardgame.rate.toFixed(2)}
                  </Box>
                  <Box>Weight: {boardgame.complexity.toFixed(2)}/5</Box>
                  <Box>
                    Duration: {boardgame.duration.min}/{boardgame.duration.max}{" "}
                    Min
                  </Box>
                  <Box>Age: {boardgame.minAge}+</Box>
                  <Box>
                    Players: {buildPlayersRangeString(boardgame.players, ", ")}
                  </Box>
                  <Box>
                    Best players:{" "}
                    {boardgame.bestPlayers
                      .map((minMax) => buildPlayersRangeString(minMax, ", "))
                      .join(", ")}
                  </Box>
                </>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export const Boardgames = (): JSX.Element => {
  const [queryParams, setQueryParams] = useQueryParams((params) => ({
    page: filtersSchemas.page.parse(params["page"]),
    rowsPerPage: filtersSchemas.rowsPerPage.parse(params["rowsPerPage"]),
    search: filtersSchemas.search.parse(params["search"]),
    minPlayers: filtersSchemas.players.parse(params["minPlayers"]),
    maxPlayers: filtersSchemas.players.parse(params["maxPlayers"]),
    minBestPlayers: filtersSchemas.players.parse(params["minBestPlayers"]),
    maxBestPlayers: filtersSchemas.players.parse(params["maxBestPlayers"]),
  }));

  const fetchBoardgamesParams: BoardgamesDto["querystring"] = {
    page: queryParams.page,
    rowsPerPage: queryParams.rowsPerPage,
  };
  if (queryParams.search !== undefined) {
    fetchBoardgamesParams.search = queryParams.search;
  }
  if (queryParams.minPlayers !== undefined) {
    fetchBoardgamesParams.minPlayers = queryParams.minPlayers;
  }
  if (queryParams.maxPlayers !== undefined) {
    fetchBoardgamesParams.maxPlayers = queryParams.maxPlayers;
  }
  if (queryParams.minBestPlayers !== undefined) {
    fetchBoardgamesParams.minBestPlayers = queryParams.minBestPlayers;
  }
  if (queryParams.maxBestPlayers !== undefined) {
    fetchBoardgamesParams.maxBestPlayers = queryParams.maxBestPlayers;
  }

  const { loading, error, data } = useFetchBoardgames(fetchBoardgamesParams);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleToggleFilters = (): void => {
    setFiltersOpen(!filtersOpen);
  };

  let body;
  if (error) {
    body = (
      <Box
        sx={{
          paddingY: 5,
          paddingX: 2,
        }}
      >
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Something unexpected occurred. Please try refreshing the page.
        </Alert>
      </Box>
    );
  } else if (loading) {
    body = (
      <Box
        sx={{
          paddingY: 5,
          paddingX: 2,
        }}
      >
        <LinearProgress />
      </Box>
    );
  } else {
    body = (
      <>
        <BoardgamesList boardgames={data.data} />
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
      </>
    );
  }

  return (
    <>
      <Box sx={{ ml: { md: `${SIDEBAR_WITH}px` } }}>
        <Box sx={{ marginX: "auto", maxWidth: 800 }}>
          <ListToolbar
            initialSearchValue={queryParams.search}
            onSearch={(searchValue) => {
              setQueryParams({
                search: searchValue,
                page: 0,
              });
            }}
            onClickFiltersIcon={() => {
              handleToggleFilters();
            }}
          />
          {body}
        </Box>
      </Box>
      <FiltersSidebar
        open={filtersOpen}
        onClose={() => {
          handleToggleFilters();
        }}
        initialValues={{
          minPlayers: queryParams.minPlayers,
          maxPlayers: queryParams.maxPlayers,
          minBestPlayers: queryParams.minBestPlayers,
          maxBestPlayers: queryParams.maxBestPlayers,
        }}
        onFilter={({
          maxPlayers,
          minPlayers,
          minBestPlayers,
          maxBestPlayers,
        }) => {
          setQueryParams({
            page: 0,
            maxPlayers,
            minPlayers,
            minBestPlayers,
            maxBestPlayers,
          });
        }}
      />
    </>
  );
};
