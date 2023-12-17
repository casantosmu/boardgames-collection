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
  IconButton,
  Divider,
  ListItem,
  ListItemText,
  List,
  Drawer,
  ListItemAvatar,
  Stack,
  TextField,
  Button,
  Autocomplete,
  alpha,
  AppBar,
  Container,
  Snackbar,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AccountCircle,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useQueryParams } from "./query-params";
import {
  getImageSrc,
  useBoardgamesQuery,
  useClassificationsQuery,
  useLogoutMutation,
} from "./api";
import { removeUndefinedValuesFromObject } from "./utils";
import { useAuth } from "./auth/auth-context";
import type {
  Type,
  Category,
  Mechanism,
  Classification,
  PlayersRange,
  Boardgame,
} from "./types";

const filtersSchemas = {
  RowsPerPage: z.coerce.number().int().positive().max(100).catch(25),
  Page: z.coerce.number().int().nonnegative().catch(0),
  Search: z.string().trim().optional().catch(undefined),
  Players: z.coerce.number().int().positive().optional().catch(undefined),
  Classification: z.array(z.coerce.number().int()).optional().catch(undefined),
};

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

const SIDEBAR_WITH = 300;

interface AlterState {
  severity: "success" | "error";
  title: string;
  message: string;
}

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
  const auth = useAuth();

  const [alert, setAlert] = useState<AlterState | null>(null);
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState(initialSearchValue ?? "");

  const handleCloseAlert = (): void => {
    setAlert(null);
  };

  const handleCloseMenu = (): void => {
    setMenuElement(null);
  };

  const { status, mutate } = useLogoutMutation({
    onSuccess() {
      auth.dispatch({ type: "LOGOUT" });
      setAlert({
        severity: "success",
        title: "Logged out",
        message: "You are now logged out of your account.",
      });
      handleCloseMenu();
    },
    onError() {
      setAlert({
        severity: "error",
        title: "Error",
        message: "Something unexpected occurred.",
      });
      handleCloseMenu();
    },
  });

  return (
    <>
      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alert.severity}
            sx={{ width: "100%" }}
          >
            <AlertTitle>{alert.title}</AlertTitle>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
      <AppBar
        position="absolute"
        sx={{
          marginLeft: { md: SIDEBAR_WITH },
          width: { md: `calc(100% - ${SIDEBAR_WITH}px)` },
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open filters"
            onClick={onClickFiltersIcon}
            sx={{ display: { md: "none" }, mr: 2 }}
          >
            <FilterListIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: { xs: "none", sm: "block" },
              textDecoration: "none",
              color: "inherit",
            }}
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
                  const value = filtersSchemas.Search.parse(search);
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
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          {auth.state?.id === undefined ? (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          ) : (
            <div>
              <IconButton
                size="large"
                aria-label="user menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={(event) => {
                  setMenuElement(event.currentTarget);
                }}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={menuElement}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(menuElement)}
                onClose={() => {
                  handleCloseMenu();
                }}
              >
                <MenuItem
                  onClick={() => {
                    mutate();
                  }}
                  disabled={status === "loading"}
                >
                  Logout
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

interface FiltersPlayers {
  minPlayers: number | undefined;
  maxPlayers: number | undefined;
  minBestPlayers: number | undefined;
  maxBestPlayers: number | undefined;
}

interface FiltersClassificationsValues {
  types: number[] | undefined;
  categories: number[] | undefined;
  mechanisms: number[] | undefined;
}

interface FiltersClassificationsOptions {
  types: Type[];
  categories: Category[];
  mechanisms: Mechanism[];
}

interface FiltersSidebarProps {
  /** Same HTML is render in parallel for desktop and mobile. Kind allows to have unique id form values.  */
  kind: string;
  onClose?: () => void;
  initialPlayers: FiltersPlayers;
  onFilterPlayers: (value: FiltersPlayers) => void;
  classificationsValues: FiltersClassificationsValues;
  classificationsOptions: FiltersClassificationsOptions;
  onFilterClassification: (kind: Classification, value: number[]) => void;
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

  const typesValues =
    classificationsValues.types?.map((id) => {
      const options = classificationsOptions.types;
      const foundOption = options.find((option) => id === option.id);
      if (!foundOption) {
        throw new Error(
          `No option found for type ${id}: ${JSON.stringify(options)}`,
        );
      }
      return foundOption;
    }) ?? [];

  const categoriesValues =
    classificationsValues.categories?.map((id) => {
      const options = classificationsOptions.categories;
      const foundOption = options.find((option) => id === option.id);
      if (!foundOption) {
        throw new Error(
          `No option found for category ${id}: ${JSON.stringify(options)}`,
        );
      }
      return foundOption;
    }) ?? [];

  const mechanismsValues =
    classificationsValues.mechanisms?.map((id) => {
      const options = classificationsOptions.mechanisms;
      const foundOption = options.find((option) => id === option.id);
      if (!foundOption) {
        throw new Error(
          `No option found for mechanism ${id}: ${JSON.stringify(options)}`,
        );
      }
      return foundOption;
    }) ?? [];

  const handleOnSubmitPlayers = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const minPlayers = filtersSchemas.Players.parse(players.minPlayers);
    const maxPlayers = filtersSchemas.Players.parse(players.maxPlayers);
    const minBestPlayers = filtersSchemas.Players.parse(players.minBestPlayers);
    const maxBestPlayers = filtersSchemas.Players.parse(players.maxBestPlayers);
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
          handleOnSubmitPlayers(event);
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
          handleOnSubmitPlayers(event);
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
          value={typesValues}
          options={classificationsOptions.types}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Types" />
          )}
          onChange={(event, value) => {
            onFilterClassification(
              "types",
              value.map((type) => type.id),
            );
          }}
        />
        <Autocomplete
          sx={{ paddingTop: 2 }}
          multiple
          id={`${kind}-categories`}
          value={categoriesValues}
          options={classificationsOptions.categories}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Categories" />
          )}
          onChange={(event, value) => {
            onFilterClassification(
              "categories",
              value.map((type) => type.id),
            );
          }}
        />
        <Autocomplete
          sx={{ paddingTop: 2 }}
          multiple
          id={`${kind}-mechanisms`}
          value={mechanismsValues}
          options={classificationsOptions.mechanisms}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            // @ts-expect-error MUI error
            <TextField {...params} variant="standard" label="Mechanisms" />
          )}
          onChange={(event, value) => {
            onFilterClassification(
              "mechanisms",
              value.map((type) => type.id),
            );
          }}
        />
      </Box>
    </>
  );
};

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
  for (let index = min; index <= max; index++) {
    range.push(index);
  }
  return range.join(separator);
};

interface BoardgamesListProps {
  boardgames: Boardgame[];
}

const BoardgamesList = ({ boardgames }: BoardgamesListProps): JSX.Element => {
  return (
    <List aria-labelledby={"Boardgames"}>
      {boardgames.map((boardgame) => (
        <ListItem key={boardgame.id}>
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
        </ListItem>
      ))}
    </List>
  );
};

interface QueryParams {
  page: number;
  rowsPerPage: number;
  search: string | undefined;
  minPlayers: number | undefined;
  maxPlayers: number | undefined;
  minBestPlayers: number | undefined;
  maxBestPlayers: number | undefined;
  types: number[] | undefined;
  categories: number[] | undefined;
  mechanisms: number[] | undefined;
}

const parseQueryParams = (params: Record<string, unknown>): QueryParams => ({
  page: filtersSchemas.Page.parse(params["page"]),
  rowsPerPage: filtersSchemas.RowsPerPage.parse(params["rowsPerPage"]),
  search: filtersSchemas.Search.parse(params["search"]),
  minPlayers: filtersSchemas.Players.parse(params["minPlayers"]),
  maxPlayers: filtersSchemas.Players.parse(params["maxPlayers"]),
  minBestPlayers: filtersSchemas.Players.parse(params["minBestPlayers"]),
  maxBestPlayers: filtersSchemas.Players.parse(params["maxBestPlayers"]),
  types: filtersSchemas.Classification.parse(params["types"]),
  categories: filtersSchemas.Classification.parse(params["categories"]),
  mechanisms: filtersSchemas.Classification.parse(params["mechanisms"]),
});

export const Boardgames = (): JSX.Element => {
  const [queryParams, setQueryParams] = useQueryParams(parseQueryParams);

  const boardgamesQueryParams = removeUndefinedValuesFromObject(queryParams);
  const boardgamesQuery = useBoardgamesQuery(boardgamesQueryParams);

  const classificationsQuery = useClassificationsQuery();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleToggleFilters = (): void => {
    setFiltersOpen(!filtersOpen);
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
    value: number[],
  ): void => {
    setQueryParams({
      [kind]: value,
    });
  };

  let body;
  if (boardgamesQuery.status === "error") {
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
  } else if (
    boardgamesQuery.status === "idle" ||
    boardgamesQuery.status === "loading"
  ) {
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
        <BoardgamesList boardgames={boardgamesQuery.data.data} />
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50]}
          count={boardgamesQuery.data.metadata.count}
          rowsPerPage={queryParams.rowsPerPage}
          page={queryParams.page}
          onPageChange={(_, newPage) => {
            setQueryParams({
              page: newPage,
            });
          }}
          onRowsPerPageChange={(event) => {
            setQueryParams({
              rowsPerPage: Number.parseInt(event.target.value, 10),
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
  if (classificationsQuery.status === "error") {
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
  } else if (
    classificationsQuery.status === "idle" ||
    classificationsQuery.status === "loading"
  ) {
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
        classificationsOptions={classificationsQuery.data.data}
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
        classificationsOptions={classificationsQuery.data.data}
        onFilterClassification={(kind, value) => {
          handleOnFilterClassification(kind, value);
        }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <ListToolbar
        initialSearchValue={queryParams.search}
        onSearch={(value) => {
          setQueryParams({
            search: value,
            page: 0,
          });
        }}
        onClickFiltersIcon={() => {
          handleToggleFilters();
        }}
      />
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
            position: "relative",
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
            position: "relative",
            boxSizing: "border-box",
            width: SIDEBAR_WITH,
          },
        }}
      >
        {sidebarBodyDesktop ?? sidebarBodyStatus}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {body}
        </Container>
      </Box>
    </Box>
  );
};
