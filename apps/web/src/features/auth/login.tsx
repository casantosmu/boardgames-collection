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
import { useNavigate, Link as LinkRouter, Navigate } from "react-router-dom";
import { errorCodes } from "common";
import { useForm } from "../../hooks/form";
import { useAuth } from "../../providers/auth";
import { useLoginMutation } from "./api";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const { status, error, mutate } = useLoginMutation({
    onSuccess(data) {
      auth.dispatch({
        type: "LOGIN",
        payload: data,
      });
      navigate("/");
    },
  });

  const { inputs, handleSubmit } = useForm({
    values: {
      email: "",
      password: "",
    },
  });

  if (auth.state) {
    return <Navigate to="/" replace />;
  }

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
          onSubmit={handleSubmit(mutate)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            {...inputs.email}
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
          />
          <TextField
            {...inputs.password}
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={status === "loading"}
          >
            Sign In
          </Button>
          {error && (
            <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
              {error.code === errorCodes.unauthorized
                ? "Invalid email or password"
                : "Something unexpected occurred."}
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
