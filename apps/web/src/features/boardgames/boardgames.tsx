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
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AccountCircle,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import classifications from "common/generated/classifications";
import { useQueryParams } from "../../hooks/query-params";
import { useLogoutMutation } from "../auth/api";
import { objectKeys, removeUndefinedValuesFromObject } from "../../utils";
import { useAuth } from "../../providers/auth";
import { useToast } from "../../providers/toast";
import { useForm } from "../../hooks/form";
import { useBoardgamesQuery } from "./api";
import { parseQueryParams, type QueryParamsSchema } from "./query-params";
import { buildPlayersRangeString } from "./utils";

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
  onSearchSubmit: (value: string | undefined) => void;
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
      onSearchSubmit(search.trim() || undefined);
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

interface Classification {
  id: number;
  name: string;
}

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

type FiltersValue = Partial<
  Record<ClassificationField, number[] | undefined> &
    Record<PlayerField, string | undefined> & { weight: string | undefined }
>;

interface FiltersProps {
  /** Same HTML is render in parallel for desktop and mobile. Kind allows to have unique id form values.  */
  kind: string;
  playersQuery: Record<PlayerField, string>;
  classificationsQuery: Record<ClassificationField, number[]>;
  weightQuery: string;
  onFilterSubmit: (value: FiltersValue) => void;
}

const Filters = ({
  kind,
  playersQuery,
  classificationsQuery,
  weightQuery,
  onFilterSubmit,
}: FiltersProps): JSX.Element => {
  const { inputs, handleSubmit } = useForm({
    values: playersQuery,
  });

  const handleClear = (): void => {
    const filters: FiltersValue = {
      weight: undefined,
    };
    for (const key of objectKeys(playersQuery)) {
      filters[key] = undefined;
    }
    for (const key of objectKeys(classificationsQuery)) {
      filters[key] = undefined;
    }
    onFilterSubmit(filters);
  };

  const handleClassificationChange = (
    filed: ClassificationField,
    value: number[],
  ): void => {
    onFilterSubmit({ [filed]: value });
  };

  const handleWeightChange = (event: SelectChangeEvent): void => {
    onFilterSubmit({
      weight: event.target.value || undefined,
    });
  };

  return (
    <>
      <MUIToolbar />
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          paddingX: 1,
          paddingTop: 1,
        }}
      >
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
      </Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onFilterSubmit)}
        sx={{ paddingX: 1 }}
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
        sx={{ paddingTop: 2, paddingX: 1, paddingBottom: 2 }}
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
      <Divider />
      <Box sx={{ paddingTop: 2, paddingX: 1, paddingBottom: 2 }}>
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
      <Divider />
      <Box sx={{ paddingTop: 2, paddingX: 1 }}>
        <FormControl fullWidth>
          <InputLabel id={`${kind}-weight-label`}>Weight</InputLabel>
          <Select
            labelId={`${kind}-weight-label`}
            id={`${kind}-weight`}
            value={weightQuery}
            label="Weight"
            onChange={handleWeightChange}
          >
            <MenuItem value={""}>None</MenuItem>
            <MenuItem value={"1"}>1</MenuItem>
            <MenuItem value={"2"}>2</MenuItem>
            <MenuItem value={"3"}>3</MenuItem>
            <MenuItem value={"4"}>4</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </>
  );
};

interface BoardgamesListProps {
  queryParams: QueryParamsSchema;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: string) => void;
}

const BoardgamesList = ({
  queryParams,
  onPageChange,
  onRowsPerPageChange,
}: BoardgamesListProps): JSX.Element => {
  const boardgamesQueryParams = removeUndefinedValuesFromObject(queryParams);
  const boardgamesQuery = useBoardgamesQuery(boardgamesQueryParams);

  const handlePageChange = (page: number): void => {
    onPageChange(page);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    onRowsPerPageChange(event.target.value);
  };

  if (boardgamesQuery.status === "error") {
    return (
      <Box sx={{ paddingY: 5, paddingX: 2 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Something unexpected occurred. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  if (
    boardgamesQuery.status === "idle" ||
    boardgamesQuery.status === "loading"
  ) {
    return (
      <Box sx={{ paddingY: 5, paddingX: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <List aria-label={"Boardgames"}>
        {boardgamesQuery.data.data.map((boardgame) => (
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
                    Players: {buildPlayersRangeString(boardgame.players)}
                  </Box>
                  <Box>
                    Best players:{" "}
                    {boardgame.bestPlayers
                      .map((minMax) => buildPlayersRangeString(minMax))
                      .join(", ")}
                  </Box>
                </>
              }
              secondaryTypographyProps={{ component: "div" }}
            />
          </ListItem>
        ))}
      </List>
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
};

export const Boardgames = (): JSX.Element => {
  const [queryParams, setQueryParams] = useQueryParams(parseQueryParams);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handlePageChange = (page: number): void => {
    setQueryParams({ page });
  };

  const handleRowsPerPageChange = (rowsPerPage: string): void => {
    setQueryParams({
      rowsPerPage,
      page: 0,
    });
  };

  const handleSearchSubmit = (value: string | undefined): void => {
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

  const weight = queryParams.weight?.toString() ?? "";

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
          weightQuery={weight}
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
          weightQuery={weight}
          onFilterSubmit={handleFiltersSubmit}
        />
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
      >
        <MUIToolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <BoardgamesList
            queryParams={queryParams}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Container>
      </Box>
    </Box>
  );
};
