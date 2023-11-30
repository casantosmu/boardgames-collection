import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { Register as RegisterDto } from "dtos/v1";
import { ApiError, getApiUrl } from "../api";
import { useAuth } from "./auth-context";

export const Register = (): JSX.Element => {
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
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            fetch(getApiUrl(location.origin, "/v1/auth/register"), {
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
              .then((data: RegisterDto["response"]["200"]) => {
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
            Register
          </Button>
        </Box>
        {error}
      </Box>
    </Container>
  );
};
