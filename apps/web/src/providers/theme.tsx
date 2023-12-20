import {
  createTheme,
  CssBaseline,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material";
import type { PropsWithChildren } from "react";

const defaultTheme = createTheme();

export const ThemeProvider = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <MUIThemeProvider theme={defaultTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};
