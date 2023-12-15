import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { errorCodes, regexp } from "common";
import { register } from "../api";
import { useAuth } from "./auth-context";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState({
    value: "",
    error: false,
  });
  const [password, setPassword] = useState({
    value: "",
    error: false,
  });
  const [error, setError] = useState<string | null>();

  const handleRegister = async (): Promise<void> => {
    const result = await register({
      email: email.value,
      password: password.value,
    });

    if (!result.success) {
      switch (result.error.code) {
        case errorCodes.invalidEmail: {
          setEmail({
            value: email.value,
            error: true,
          });
          setError(null);
          return;
        }
        case errorCodes.invalidPassword: {
          setPassword({
            value: password.value,
            error: true,
          });
          setError(null);
          return;
        }
        case errorCodes.emailExists: {
          setError("Email already exists");
          return;
        }
        default: {
          setError("Something unexpected occurred.");
          return;
        }
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
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleRegister();
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
            error={email.error}
            value={email.value}
            helperText={
              email.error ? "Please enter a valid email address." : undefined
            }
            onChange={(event) => {
              setEmail({
                value: event.target.value,
                error: false,
              });
              setError(null);
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
            error={password.error}
            value={password.value}
            helperText={
              password.error ? regexp.password.description : undefined
            }
            onChange={(event) => {
              setPassword({
                value: event.target.value,
                error: false,
              });
              setError(null);
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
          {error && (
            <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
};
