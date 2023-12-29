import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  TablePagination,
  styled,
  InputBase,
  Toolbar as MUIToolbar,
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
import classifications from "common/generated/classifications";
import { useQueryParams } from "../../hooks/query-params";
import { useLogoutMutation } from "../auth/api";
import { removeUndefinedValuesFromObject } from "../../utils";
import { useAuth } from "../../providers/auth";
import { useToast } from "../../providers/toast";
import type { Classification, PlayersRange, Boardgame } from "../../types";
import { useForm } from "../../hooks/form";
import { useBoardgamesQuery } from "./api";

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

interface ToolbarProps {
  searchQuery: string;
  onSearchSubmit: (value: string) => void;
  onClickFiltersIcon: () => void;
}

const Toolbar = ({
  searchQuery,
  onSearchSubmit,
  onClickFiltersIcon,
}: ToolbarProps): JSX.Element => {
  const auth = useAuth();
  const { handleOpenToast } = useToast();

  const [search, setSearch] = useState(searchQuery);
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null);

  const handleSearchSubmit = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      onSearchSubmit(search);
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleCloseMenu = (): void => {
    setMenuElement(null);
  };

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>): void => {
    setMenuElement(event.currentTarget);
  };

  const { status, mutate } = useLogoutMutation({
    onSuccess() {
      auth.dispatch({ type: "LOGOUT" });
      handleOpenToast({
        severity: "success",
        title: "Logged out",
        message: "You are now logged out of your account.",
        origin: { vertical: "top", horizontal: "right" },
      });
      handleCloseMenu();
    },
    onError() {
      handleOpenToast({
        severity: "error",
        title: "Error",
        message: "Something unexpected occurred.",
        origin: { vertical: "top", horizontal: "right" },
      });
      handleCloseMenu();
    },
  });

  return (
    <>
      <AppBar
        position="absolute"
        sx={{
          marginLeft: { md: SIDEBAR_WITH },
          width: { md: `calc(100% - ${SIDEBAR_WITH}px)` },
        }}
      >
        <MUIToolbar>
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
              onKeyUp={handleSearchSubmit}
              onChange={handleSearchChange}
              placeholder="Search…"
              value={search}
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          {auth.state === null ? (
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
                onClick={handleOpenMenu}
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
                onClose={handleCloseMenu}
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
        </MUIToolbar>
      </AppBar>
    </>
  );
};

interface ClassificationInputProps {
  id: string;
  label: string;
  values: number[];
  options: Classification[];
  onChange: (value: number[]) => void;
}

const ClassificationInput = ({
  id,
  label,
  values,
  options,
  onChange,
}: ClassificationInputProps): JSX.Element => {
  const handleChange = (value: Classification[]): void => {
    onChange(value.map((type) => type.id));
  };

  const valuesWithLabel = values.map((valueId) => {
    const foundOption = options.find((option) => valueId === option.id);
    if (!foundOption) {
      throw new Error(
        `No option found on ${id} for ${valueId}: ${JSON.stringify(options)}`,
      );
    }
    return foundOption;
  });

  return (
    <Autocomplete
      multiple
      id={id}
      value={valuesWithLabel}
      options={options}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        // @ts-expect-error MUI error
        <TextField {...params} variant="standard" label={label} />
      )}
      onChange={(_, value) => {
        handleChange(value);
      }}
    />
  );
};

type PlayerField =
  | "minPlayers"
  | "maxPlayers"
  | "minBestPlayers"
  | "maxBestPlayers";

type ClassificationField = "types" | "categories" | "mechanisms";

type PlayersFilter = Record<PlayerField, string>;

type ClassificationsFilter = Record<ClassificationField, number[]>;

type FiltersValue = Partial<ClassificationsFilter & PlayersFilter>;

interface FiltersProps {
  /** Same HTML is render in parallel for desktop and mobile. Kind allows to have unique id form values.  */
  kind: string;
  playersQuery: PlayersFilter;
  classificationsQuery: ClassificationsFilter;
  onFilterSubmit: (value: FiltersValue) => void;
}

const Filters = ({
  kind,
  playersQuery,
  classificationsQuery,
  onFilterSubmit,
}: FiltersProps): JSX.Element => {
  const { inputs, handleSubmit, reset } = useForm({
    initialValues: playersQuery,
  });
  const [previousPlayers, setPreviousPlayers] = useState(playersQuery);

  if (playersQuery !== previousPlayers) {
    setPreviousPlayers(playersQuery);
    reset(playersQuery);
  }

  const handleClassificationChange = (
    filed: ClassificationField,
    value: number[],
  ): void => {
    onFilterSubmit({ [filed]: value });
  };

  return (
    <>
      <MUIToolbar />
      <Divider />
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onFilterSubmit)}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            {...inputs.minPlayers}
            id={`${kind}-min-players`}
            label="Min"
            variant="outlined"
            size="small"
            inputProps={{ "aria-label": "Min players" }}
          />
          <TextField
            {...inputs.maxPlayers}
            id={`${kind}-max-players`}
            label="Max"
            variant="outlined"
            size="small"
            inputProps={{ "aria-label": "Max players" }}
          />
          <Button type="submit">Go</Button>
        </Stack>
      </Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onFilterSubmit)}
        sx={{ paddingTop: 2, paddingX: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Best players
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            {...inputs.minBestPlayers}
            id={`${kind}-min-best-players`}
            label="Min"
            variant="outlined"
            size="small"
            inputProps={{ "aria-label": "Min best players" }}
          />
          <TextField
            {...inputs.maxBestPlayers}
            id={`${kind}-max-best-players`}
            label="Max"
            variant="outlined"
            size="small"
            inputProps={{ "aria-label": "Max best players" }}
          />
          <Button type="submit">Go</Button>
        </Stack>
      </Box>
      <Box sx={{ paddingTop: 2, paddingX: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Classifications
        </Typography>
        <ClassificationInput
          id={`${kind}-types`}
          label="Types"
          values={classificationsQuery.types}
          options={classifications.types}
          onChange={(value) => {
            handleClassificationChange("types", value);
          }}
        />
        <Box sx={{ paddingTop: 2 }}>
          <ClassificationInput
            id={`${kind}-categories`}
            label="Categories"
            values={classificationsQuery.categories}
            options={classifications.categories}
            onChange={(value) => {
              handleClassificationChange("categories", value);
            }}
          />
        </Box>
        <Box sx={{ paddingTop: 2 }}>
          <ClassificationInput
            id={`${kind}-mechanisms`}
            label="Mechanisms"
            values={classificationsQuery.mechanisms}
            options={classifications.mechanisms}
            onChange={(value) => {
              handleClassificationChange("mechanisms", value);
            }}
          />
        </Box>
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
    <List aria-label={"Boardgames"}>
      {boardgames.map((boardgame) => (
        <ListItem key={boardgame.id}>
          <ListItemAvatar sx={{ width: 80 }}>
            <img
              height={64}
              width={64}
              alt={boardgame.name}
              src={boardgame.images["96x96"]}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <>
                {boardgame.name}{" "}
                <Box sx={{ color: "text.secondary", display: "inline" }}>
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

const PageQuerySchema = z.coerce.number().int().nonnegative().catch(0);

const RowsPerPageQuerySchema = z.coerce
  .number()
  .int()
  .positive()
  .max(100)
  .catch(25);

const SearchQuerySchema = z.string().trim().optional().catch(undefined);

const PlayerQuerySchema = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .catch(undefined);

const ClassificationQuerySchema = z
  .array(z.coerce.number().int().nonnegative())
  .optional()
  .catch(undefined);

const QueryParamsSchema = z.object({
  page: PageQuerySchema,
  rowsPerPage: RowsPerPageQuerySchema,
  search: SearchQuerySchema,
  minPlayers: PlayerQuerySchema,
  maxPlayers: PlayerQuerySchema,
  minBestPlayers: PlayerQuerySchema,
  maxBestPlayers: PlayerQuerySchema,
  types: ClassificationQuerySchema,
  categories: ClassificationQuerySchema,
  mechanisms: ClassificationQuerySchema,
});

const parseQueryParams = (params: unknown): z.infer<typeof QueryParamsSchema> =>
  QueryParamsSchema.parse(params);

export const Boardgames = (): JSX.Element => {
  const [queryParams, setQueryParams] = useQueryParams(parseQueryParams);

  const boardgamesQueryParams = removeUndefinedValuesFromObject(queryParams);
  const boardgamesQuery = useBoardgamesQuery(boardgamesQueryParams);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handlePageChange = (page: number): void => {
    setQueryParams({ page });
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setQueryParams({
      rowsPerPage: event.target.value,
      page: 0,
    });
  };

  const handleSearchSubmit = (value: string): void => {
    setQueryParams({
      search: value,
      page: 0,
    });
  };

  const handleToggleFilters = (): void => {
    setFiltersOpen(!filtersOpen);
  };

  const handleFiltersSubmit = (value: FiltersValue): void => {
    setQueryParams({
      ...value,
      page: 0,
    });
  };

  let body;
  if (boardgamesQuery.status === "error") {
    body = (
      <Box sx={{ paddingY: 5, paddingX: 2 }}>
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
      <Box sx={{ paddingY: 5, paddingX: 2 }}>
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
          onPageChange={(_, page) => {
            handlePageChange(page);
          }}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </>
    );
  }

  const search = queryParams.search ?? "";

  const players = {
    minPlayers: queryParams.minPlayers?.toString() ?? "",
    maxPlayers: queryParams.maxPlayers?.toString() ?? "",
    minBestPlayers: queryParams.minBestPlayers?.toString() ?? "",
    maxBestPlayers: queryParams.maxBestPlayers?.toString() ?? "",
  };

  const classifications = {
    types: queryParams.types ?? [],
    categories: queryParams.categories ?? [],
    mechanisms: queryParams.mechanisms ?? [],
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Toolbar
        key={search}
        searchQuery={search}
        onSearchSubmit={handleSearchSubmit}
        onClickFiltersIcon={handleToggleFilters}
      />
      {/* Mobile sidebar filters */}
      <Drawer
        variant="temporary"
        open={filtersOpen}
        onClose={handleToggleFilters}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            position: "relative",
            boxSizing: "border-box",
            width: SIDEBAR_WITH,
          },
        }}
      >
        <Filters
          kind="mobile"
          playersQuery={players}
          classificationsQuery={classifications}
          onFilterSubmit={(value) => {
            handleFiltersSubmit(value);
            handleToggleFilters();
          }}
        />
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
        <Filters
          kind="desktop"
          playersQuery={players}
          classificationsQuery={classifications}
          onFilterSubmit={handleFiltersSubmit}
        />
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
      >
        <MUIToolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {body}
        </Container>
      </Box>
    </Box>
  );
};
