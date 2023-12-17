import { type ChangeEvent, type FormEvent, useState } from "react";
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
import { Navigate, Link as LinkRouter, useNavigate } from "react-router-dom";
import { errorCodes, regexp } from "common";
import { z } from "zod";
import { useRegisterMutation } from "../api";
import { objectKeys } from "../utils";
import { useAuth } from "./auth-context";

const FormData = z.object({
  email: z.string().regex(regexp.email.pattern),
  password: z.string().regex(regexp.password.pattern),
});

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const { status, error, mutate } = useRegisterMutation({
    onSuccess(data) {
      auth.dispatch({
        type: "LOGIN",
        payload: data,
      });
      navigate("/");
    },
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState({
    email: false,
    password: false,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name as keyof typeof formData;
    const value = event.target.value;
    if (formError[field]) {
      const validation = FormData.shape[field].safeParse(value);
      setFormError({
        ...formError,
        [field]: !validation.success,
      });
    }
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const validation = FormData.safeParse(formData);
    if (validation.success) {
      const resetFormError = { ...formError };
      for (const key of objectKeys(formError)) {
        resetFormError[key] = false;
      }
      setFormError(resetFormError);
      setFormData(validation.data);
      mutate(validation.data);
    } else {
      const errors = validation.error.flatten();
      const resetFormError = { ...formError };
      for (const key of objectKeys(errors.fieldErrors)) {
        resetFormError[key] = true;
      }
      setFormError(resetFormError);
    }
  };

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
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            autoComplete="email"
            error={formError.email}
            value={formData.email}
            helperText={
              formError.email
                ? "Please enter a valid email address."
                : undefined
            }
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={formError.password}
            value={formData.password}
            helperText={
              formError.password ? regexp.password.description : undefined
            }
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={status === "loading"}
          >
            Register
          </Button>
          {error && (
            <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
              {error.code === errorCodes.emailExists
                ? "Email already exists"
                : "Something unexpected occurred."}
            </Alert>
          )}
          <Link component={LinkRouter} to="/login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Box>
    </Container>
  );
};
