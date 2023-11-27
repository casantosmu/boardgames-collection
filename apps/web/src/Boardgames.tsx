import { FormEvent, useState } from "react";
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
  Autocomplete,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useQueryParams } from "./queryParams";
import {
  getImageSrc,
  useFetchBoardgames,
  useFetchClassifications,
} from "./api";
import { removeUndefinedValuesFromObject } from "./utils";

const filtersSchemas = {
  rowsPerPage: z.coerce.number().int().positive().max(100).catch(25),
  page: z.coerce.number().int().nonnegative().catch(0),
  search: z.string().trim().optional().catch(undefined),
  players: z.coerce.number().int().positive().optional().catch(undefined),
  classification: z.array(z.string().trim()).optional().catch(undefined),
};

type Classification = "types" | "categories" | "mechanisms";

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

const BOARDGAMES_LIST_TITLE_ID = "listTitle";

interface ListToolbarProps {
  initialSearchValue: string | undefined;
  onSearch: (value: string | undefined) => void;
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
        id={BOARDGAMES_LIST_TITLE_ID}
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

interface FiltersPlayers {
  minBestPlayers: number | undefined;
  maxBestPlayers: number | undefined;
  minPlayers: number | undefined;
  maxPlayers: number | undefined;
}

interface FiltersClassifications {
  types: string[] | undefined;
  categories: string[] | undefined;
  mechanisms: string[] | undefined;
}

interface FiltersSidebarProps {
  // Same HTML is render in parallel for desktop and mobile. Kind allows to have unique id form values.
  kind: string;
  onClose?: () => void;
  initialPlayers: FiltersPlayers;
  onFilterPlayers: (value: FiltersPlayers) => void;
  classificationsValues: FiltersClassifications;
  classificationsOptions: FiltersClassifications;
  onFilterClassification: (kind: Classification, value: string[]) => void;
}

const FiltersSidebarForm = ({
  kind,
  onClose,
  initialPlayers,
  onFilterPlayers,
  classificationsValues,
  classificationsOptions,
  onFilterClassification,
}: FiltersSidebarProps): JSX.Element => {
  const [players, setPlayers] = useState({
    minPlayers: initialPlayers.minPlayers?.toString() ?? "",
    maxPlayers: initialPlayers.maxPlayers?.toString() ?? "",
    minBestPlayers: initialPlayers.minBestPlayers?.toString() ?? "",
    maxBestPlayers: initialPlayers.maxBestPlayers?.toString() ?? "",
  });

  const onSubmitPlayers = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const minPlayers = filtersSchemas.players.parse(players.minPlayers);
    const maxPlayers = filtersSchemas.players.parse(players.maxPlayers);
    const minBestPlayers = filtersSchemas.players.parse(players.minBestPlayers);
    const maxBestPlayers = filtersSchemas.players.parse(players.maxBestPlayers);
    onFilterPlayers({
      minPlayers,
      maxPlayers,
      minBestPlayers,
      maxBestPlayers,
    });
    setPlayers({
      minPlayers: minPlayers?.toString() ?? "",
      maxPlayers: maxPlayers?.toString() ?? "",
      minBestPlayers: minBestPlayers?.toString() ?? "",
      maxBestPlayers: maxBestPlayers?.toString() ?? "",
    });
    onClose?.();
  };

  return (
    <>
      <Toolbar />
      <Divider />
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          onSubmitPlayers(event);
        }}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            id={`${kind}-min-players`}
            label="Min"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setPlayers({
                ...players,
                minPlayers: event.target.value,
              });
            }}
            value={players.minPlayers}
            inputProps={{ "aria-label": "Min players" }}
          />
          <TextField
            id={`${kind}-max-players`}
            label="Max"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setPlayers({
                ...players,
                maxPlayers: event.target.value,
              });
            }}
            value={players.maxPlayers}
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
          onSubmitPlayers(event);
        }}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Best players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            id={`${kind}-min-best-players`}
            label="Min"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setPlayers({
                ...players,
                minBestPlayers: event.target.value,
              });
            }}
            value={players.minBestPlayers}
            inputProps={{ "aria-label": "Min best players" }}
          />
          <TextField
            id={`${kind}-max-best-players`}
            label="Max"
            variant="outlined"
            size="small"
            onChange={(event) => {
              setPlayers({
                ...players,
                maxBestPlayers: event.target.value,
              });
            }}
            value={players.maxBestPlayers}
            inputProps={{ "aria-label": "Max best players" }}
          />
          <Button type="submit">Go</Button>
        </Stack>
      </Box>
      <Box sx={{ paddingTop: 2, paddingX: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Classifications
        </Typography>
        <Autocomplete
          multiple
          id={`${kind}-types`}
          value={classificationsValues.types ?? []}
          options={classificationsOptions.types ?? []}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Types" />
          )}
          onChange={(event, value) => {
            onFilterClassification("types", value);
          }}
        />
        <Autocomplete
          sx={{ paddingTop: 2 }}
          multiple
          id={`${kind}-categories`}
          value={classificationsValues.categories ?? []}
          options={classificationsOptions.categories ?? []}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Categories" />
          )}
          onChange={(event, value) => {
            onFilterClassification("categories", value);
          }}
        />
        <Autocomplete
          sx={{ paddingTop: 2 }}
          multiple
          id={`${kind}-mechanisms`}
          value={classificationsValues.mechanisms ?? []}
          options={classificationsOptions.mechanisms ?? []}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Mechanisms" />
          )}
          onChange={(event, value) => {
            onFilterClassification("mechanisms", value);
          }}
        />
      </Box>
    </>
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
    <List aria-labelledby={BOARDGAMES_LIST_TITLE_ID}>
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
              primaryTypographyProps={{ component: "div" }}
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
              secondaryTypographyProps={{ component: "div" }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

const SIDEBAR_WITH = 300;

interface QueryParams {
  page: number;
  rowsPerPage: number;
  search: string | undefined;
  minPlayers: number | undefined;
  maxPlayers: number | undefined;
  minBestPlayers: number | undefined;
  maxBestPlayers: number | undefined;
  types: string[] | undefined;
  categories: string[] | undefined;
  mechanisms: string[] | undefined;
}

const parseQueryParams = (params: Record<string, unknown>): QueryParams => ({
  page: filtersSchemas.page.parse(params["page"]),
  rowsPerPage: filtersSchemas.rowsPerPage.parse(params["rowsPerPage"]),
  search: filtersSchemas.search.parse(params["search"]),
  minPlayers: filtersSchemas.players.parse(params["minPlayers"]),
  maxPlayers: filtersSchemas.players.parse(params["maxPlayers"]),
  minBestPlayers: filtersSchemas.players.parse(params["minBestPlayers"]),
  maxBestPlayers: filtersSchemas.players.parse(params["maxBestPlayers"]),
  types: filtersSchemas.classification.parse(params["types"]),
  categories: filtersSchemas.classification.parse(params["categories"]),
  mechanisms: filtersSchemas.classification.parse(params["mechanisms"]),
});

export const Boardgames = (): JSX.Element => {
  const [queryParams, setQueryParams] = useQueryParams(parseQueryParams);

  const fetchBoardgamesParams = removeUndefinedValuesFromObject(queryParams);
  const fetchBoardgames = useFetchBoardgames(fetchBoardgamesParams);

  const fetchClassification = useFetchClassifications();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleToggleFilters = (): void => {
    setFiltersOpen(!filtersOpen);
  };

  const handleOnSearch = (value: string | undefined): void => {
    setQueryParams({
      search: value,
      page: 0,
    });
  };

  const handleOnFilterPlayers = ({
    minPlayers,
    maxPlayers,
    minBestPlayers,
    maxBestPlayers,
  }: FiltersPlayers): void => {
    setQueryParams({
      page: 0,
      minPlayers,
      maxPlayers,
      minBestPlayers,
      maxBestPlayers,
    });
  };

  const handleOnFilterClassification = (
    kind: Classification,
    value: string[],
  ): void => {
    setQueryParams({
      [kind]: value,
    });
  };

  let body;
  if (fetchBoardgames.error) {
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
  } else if (fetchBoardgames.loading) {
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
        <BoardgamesList boardgames={fetchBoardgames.data.data} />
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50]}
          count={fetchBoardgames.data.metadata.count}
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

  let sidebarBodyStatus;
  let sidebarBodyDesktop;
  let sidebarBodyMobile;
  if (fetchClassification.error) {
    sidebarBodyStatus = (
      <Box
        sx={{
          paddingY: 5,
          paddingX: 2,
        }}
      >
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Something unexpected occurred.
        </Alert>
      </Box>
    );
  } else if (fetchClassification.loading) {
    sidebarBodyStatus = (
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
    sidebarBodyMobile = (
      <FiltersSidebarForm
        kind="mobile"
        onClose={() => {
          handleToggleFilters();
        }}
        initialPlayers={queryParams}
        onFilterPlayers={(value) => {
          handleOnFilterPlayers(value);
        }}
        classificationsValues={queryParams}
        classificationsOptions={fetchClassification.data.data}
        onFilterClassification={(kind, value) => {
          handleOnFilterClassification(kind, value);
        }}
      />
    );
    sidebarBodyDesktop = (
      <FiltersSidebarForm
        kind="desktop"
        initialPlayers={queryParams}
        onFilterPlayers={(value) => {
          handleOnFilterPlayers(value);
        }}
        classificationsValues={queryParams}
        classificationsOptions={fetchClassification.data.data}
        onFilterClassification={(kind, value) => {
          handleOnFilterClassification(kind, value);
        }}
      />
    );
  }

  return (
    <>
      <Box sx={{ ml: { md: `${SIDEBAR_WITH}px` } }}>
        <Box sx={{ marginX: "auto", maxWidth: 800 }}>
          <ListToolbar
            initialSearchValue={queryParams.search}
            onSearch={(value) => {
              handleOnSearch(value);
            }}
            onClickFiltersIcon={() => {
              handleToggleFilters();
            }}
          />
          {body}
        </Box>
      </Box>
      <Box sx={{ width: { md: SIDEBAR_WITH } }}>
        {/* Mobile sidebar filters */}
        <Drawer
          variant="temporary"
          open={filtersOpen}
          onClose={() => {
            handleToggleFilters();
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
          {sidebarBodyMobile ?? sidebarBodyStatus}
        </Drawer>
        {/* Desktop sidebar filters */}
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
          {sidebarBodyDesktop ?? sidebarBodyStatus}
        </Drawer>
      </Box>
    </>
  );
};