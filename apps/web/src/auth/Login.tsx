import { useState } from "react";
import {
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
import { Login as LoginDto } from "dtos/v1";
import { z } from "zod";
import { regexp } from "common";
import { ApiError, getApiUrl } from "../api";
import { useAuth } from "./auth-context";

const formSchema = {
  email: z.string().regex(regexp.email.pattern),
  password: z.string().regex(regexp.password.pattern),
};

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>();

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

            const emailValidation = formSchema.email.safeParse(form.email);
            const passwordValidation = formSchema.password.safeParse(
              form.password,
            );
            if (!emailValidation.success && !passwordValidation.success) {
              setError("Invalid email and invalid password");
              return;
            }
            if (!emailValidation.success) {
              setError("Invalid email");
              return;
            }
            if (!passwordValidation.success) {
              setError("Invalid password");
              return;
            }

            fetch(getApiUrl(location.origin, "/v1/auth/login"), {
              method: "POST",
              body: JSON.stringify(form),
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new ApiError(response.status);
                }
                return response.json();
              })
              .then((data: LoginDto["response"]["200"]) => {
                auth.dispatch({
                  type: "LOGIN",
                  payload: data,
                });
                navigate("/");
              })
              .catch((error) => {
                if (error instanceof ApiError && error.statusCode === 401) {
                  setError("Invalid username or password");
                } else {
                  setError("Internal server error");
                }
              });
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
          <Link component={LinkRouter} to="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
        {error}
      </Box>
    </Container>
  );
};
