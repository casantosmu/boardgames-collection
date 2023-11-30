import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate, Link as LinkRouter } from "react-router-dom";
import { errorCodes } from "common";
import { login } from "../api";
import { useAuth } from "./auth-context";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>();

  const handleLogin = async (): Promise<void> => {
    const result = await login(form);

    if (!result.success) {
      switch (result.error.code) {
        case errorCodes.unauthorized: {
          setError("Invalid email or password");
          return;
        }
        default:
          setError("Internal server error");
          return;
      }
    }

    auth.dispatch({
      type: "LOGIN",
      payload: result.data,
    });
    navigate("/");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => {
              setForm({
                ...form,
                email: event.target.value,
              });
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => {
              setForm({
                ...form,
                password: event.target.value,
              });
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          {error && (
            <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Link component={LinkRouter} to="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};
