import { useState } from "react";
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
  ListItemIcon,
  ListItemText,
  List,
  Drawer,
  ListItemAvatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Inbox as InboxIcon,
  Mail as MailIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { Boardgames } from "dtos/v1";
import { useQueryParams } from "./queryParams";
import { getImageSrc, useFetchBoardgames } from "./api";

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
  onSearch: (searchValue: string) => void;
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
              const value = search.trim();
              onSearch(search);
              setSearch(value);
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

interface FiltersSidebarProps {
  open: boolean;
  onClose: () => void;
}

const FiltersSidebar = ({
  open,
  onClose,
}: FiltersSidebarProps): JSX.Element => {
  const body = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
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
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WITH,
          },
        }}
        open
      >
        {body}
      </Drawer>
    </Box>
  );
};

export function App(): JSX.Element {
  const [queryParams, setQueryParams] = useQueryParams((params) => ({
    page: Number(params["page"]) || 0,
    rowsPerPage: Number(params["rowsPerPage"]) || 25,
    search: String(params["search"] ?? "").trim() || undefined,
  }));

  const fetchBoardgamesParams: Boardgames["querystring"] = {
    page: queryParams.page,
    rowsPerPage: queryParams.rowsPerPage,
  };
  if (queryParams.search !== undefined) {
    fetchBoardgamesParams.search = queryParams.search;
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
        <List aria-labelledby="listTitle">
          {data.data.map((boardgame) => (
            <ListItem key={boardgame.id}>
              <ListItemButton
                component={Link}
                to={`/boardgames/${boardgame.id}`}
              >
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
                  secondary={boardgame.shortDescription}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
      />
    </>
  );
}
